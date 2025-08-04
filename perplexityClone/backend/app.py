from flask import Flask, Response, json, jsonify, request, stream_with_context
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_sse import sse
from models import Chat, SearchResult, Session, db

from backend.services.llm import LLMService
from backend.services.search import SearchService

app = Flask(__name__)
app.config.from_object("config")
app.register_blueprint(sse, url_prefix="/stream")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:password@localhost:5432/perplexity"
)
db = SQLAlchemy(app)

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/query": {"origins": ["http://localhost:5173"]},
        r"/query/stream": {"origins": ["http://localhost:5173"]},
    },
)


@app.route("/query", methods=["POST"])
@cross_origin(origin="*")
def query():
    data = request.json
    question_text = data.get("question")
    session_id = data.get("session_id")

    # Create or fetch session
    if session_id:
        session = Session.query.get(session_id)
    else:
        user_id = data.get("user_id")
        session = Session(user_id=user_id, timestamp=db.func.now())
        db.session.add(session)
        db.session.commit()

    # Persist chat question
    chat = Chat(
        session_id=session.id,
        question_text=question_text,
        asked_at=db.func.now(),
    )
    db.session.add(chat)
    db.session.commit()

    # Run search
    extracted_text = SearchService().search(question_text)
    sr = SearchResult(
        chat_id=chat.id,
        search_result=",".join([url for _, url in extracted_text]),
        timestamp=db.func.now(),
    )
    db.session.add(sr)
    db.session.commit()

    # kick off streaming
    @stream_with_context
    def generate():
        # first send back the session & chat IDs so client can correlate
        init = {"session_id": chat.session_id, "chat_id": chat.id}
        yield f"data: {json.dumps(init)}\n\n"

        llm = LLMService()
        full_answer = ""
        for token in llm.stream_answer(question_text, extracted_text):
            full_answer += token

            chat.llm_result_text = full_answer
            db.session.add(chat)
            db.session.commit()

            print(f"Token: {token}")
            # emit SSE chunk
            yield f"data: {json.dumps({'token': token})}\n\n"

        # 4️⃣ final commit of answered_at
        chat.answered_at = db.func.now()
        db.session.add(chat)
        db.session.commit()

    print(sr)
    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8743, debug=True)
