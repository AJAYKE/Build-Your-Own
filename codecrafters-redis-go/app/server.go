package main

import (
	"fmt"
	"io"
	"net"
	"os"
	"time"
)

var storage = make(map[string]string)
var timerMap = make(map[string]ExpiryInfo)

type ExpiryInfo struct {
	Timestamp time.Time
	Duration  int
}

func main() {
	fmt.Println("Logs from your program will appear here!")

	l, err := net.Listen("tcp", "0.0.0.0:6379")
	if err != nil {
		fmt.Println("Failed to bind to port 6379", err.Error())
		os.Exit(1)
	}

	defer l.Close()
	for {
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Unable to accept the connection", err.Error())
			continue
		}
		go handleConnection(conn)

	}
}

func handleConnection(c net.Conn) {
	defer c.Close()

	for {
		buf := make([]byte, 1024)
		n, err := c.Read(buf)
		if err != nil {
			if err != io.EOF {
				fmt.Println("Error reading:", err.Error())
			}
			return

		}
		if n == 0 {
			continue
		}

		requests := parser(buf[:n])

		if len(requests) < 1 {
			fmt.Println("No requests or Something Wrong with Request Format")
		}

		for i := 0; i < len(requests); i++ {
			subRequest := requests[i]

			response := handleCommand(subRequest)

			if response == "" {
				fmt.Println("bad response")
			}
			_, err := c.Write([]byte(response))

			if err != nil {
				fmt.Println("something went wrong while repsondiong", err.Error())
			}
		}
	}
}
