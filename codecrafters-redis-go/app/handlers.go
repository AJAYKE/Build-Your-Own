package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func handleCommand(subrequest []string) string {
	updatedCommand := strings.ToUpper(subrequest[0])
	switch updatedCommand {
	case "ECHO":
		return echoHandler(subrequest)
	case "PING":
		return pingHandler(subrequest)
	case "SET":
		return setHandler(subrequest)
	case "GET":
		return getHandler(subrequest)
	default:
		return ""
	}
}

func getHandler(subrequest []string) string {
	if len(subrequest) != 2 {
		fmt.Println("Invalid Request Format")
		return ""
	}
	key := subrequest[1]
	value, exists := storage[key]
	if !exists {
		fmt.Println("Key does not exist")
		return encoder("", false)
	}

	if expiry, hasExpiry := timerMap[key]; hasExpiry {
		expiryTime := expiry.Timestamp.Add(time.Duration(expiry.Duration) * time.Millisecond)

		if time.Now().After(expiryTime) {
			delete(storage, key)
			delete(timerMap, key)
			return encoder("", false)
		}
	}
	return encoder(value, false)
}

func setHandler(subrequest []string) string {
	if len(subrequest) < 3 {
		fmt.Println("Invalid Request Format")
		return ""
	}
	storage[subrequest[1]] = subrequest[2]
	if len(subrequest) > 3 && strings.ToUpper(subrequest[3]) == "PX" && len(subrequest) >= 4 {
		duration, err := strconv.Atoi(subrequest[4])
		if err != nil {
			fmt.Println("Invalid Data type with Duration")
			return ""
		}
		timerMap[subrequest[1]] = ExpiryInfo{Timestamp: time.Now(), Duration: duration}
	}
	return encoder("OK", true)
}

func pingHandler(subrequest []string) string {
	if len(subrequest) != 1 {
		fmt.Println("Invalid Request Format")
		return ""
	}
	response := encoder("PONG", true)
	return response

}

func echoHandler(subrequest []string) string {
	if len(subrequest) != 2 {
		fmt.Println("Invalid Request Format")
		return ""
	}
	response := encoder(subrequest[1], false)
	return response
}

func encoder(response string, isSet bool) string {
	if response == "" {
		return "$-1\r\n"
	}
	if !isSet {
		return fmt.Sprintf("$%d\r\n%s\r\n", len(response), response)
	}
	return fmt.Sprintf("+%s\r\n", response)
}
