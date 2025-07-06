package main

import "log"

type LoggerService struct{}

func NewLoggerService() *LoggerService {
	return &LoggerService{}
}

func (l *LoggerService) Info(args ...interface{}) {
	log.Println(append([]interface{}{"[INFO]"}, args...)...)
}

func (l *LoggerService) Error(args ...interface{}) {
	log.Println(append([]interface{}{"[ERROR]"}, args...)...)
}
