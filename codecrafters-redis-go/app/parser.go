package main

import (
	"fmt"
	"strconv"
	"strings"
)

func parser(buffer []byte) [][]string {
	requests := [][]string{}

	// We are parsing the request into multiple subrequests
	// Each subrequest starts with *<int>, <int> represents number of parameters,

	request := string(buffer)

	//Lets get all the subrequests that are there in this main request
	subRequests := strings.Split(request, "*")

	for _, subreq := range subRequests {

		if subreq == "" {
			continue
		}

		// Each subrequest is madeup of multiple lines, we are parsing the lines here
		linesOfCommand := strings.Split(subreq, "\r\n")

		if len(linesOfCommand) < 2 {
			continue
		}

		//First line in each subrequest represents numberofparameters
		numberOfParamters, err := strconv.Atoi(linesOfCommand[0])

		if err != nil {
			fmt.Println("Invalid Command, unable to read number of parameters", err.Error())
			continue
		}

		commands := []string{}
		for i := 0; i < numberOfParamters; i++ {
			lineIndex := i*2 + 2
			if lineIndex >= len(linesOfCommand) {
				fmt.Println("Command Length Mismatch")
				continue
			}
			commands = append(commands, linesOfCommand[lineIndex])
		}

		requests = append(requests, commands)
	}

	return requests
}
