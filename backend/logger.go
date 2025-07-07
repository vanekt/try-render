package main

import (
	"log/slog"
	"os"
)

type LoggerService struct {
	logger *slog.Logger
}

func NewLoggerService() *LoggerService {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	slog.SetDefault(logger)
	slog.SetLogLoggerLevel(slog.LevelInfo)

	return &LoggerService{
		logger,
	}
}

func (l *LoggerService) Debug(msg string, args ...interface{}) {
	l.logger.Debug(msg, args...)
}

func (l *LoggerService) Info(msg string, args ...interface{}) {
	l.logger.Info(msg, args...)
}

func (l *LoggerService) Warn(msg string, args ...interface{}) {
	l.logger.Warn(msg, args...)
}

func (l *LoggerService) Error(msg string, args ...interface{}) {
	l.logger.Error(msg, args...)
}
