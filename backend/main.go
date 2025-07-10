package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(loggingMiddleware())
	router.Use(recoveryMiddleware())
	router.Use(corsMiddleware())

	container := NewContainer()

	router.GET("/ping", bindRoute(handlePing, container))
	router.POST("/upload", bindRoute(handleUpload, container))
	auth := router.Group("/", authMiddleware(container))
	{
		auth.GET("/protected", bindRoute(handleProtected, container))
	}

	port := os.Getenv("PORT")
	container.Logger.Info(fmt.Sprintf("🚀 Server starting on :%s", port))
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		container.Logger.Error("Failed to start server:", err)
	}
}
