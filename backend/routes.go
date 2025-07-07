package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func bindRoute(handler func(*gin.Context, *Container), container *Container) gin.HandlerFunc {
	return func(c *gin.Context) {
		handler(c, container)
	}
}

func handlePing(g *gin.Context, c *Container) {
	g.JSON(http.StatusOK, gin.H{"result": "pong"})
}

func handleProtected(g *gin.Context, c *Container) {
	user, exists := g.Get("user")
	if !exists {
		g.JSON(http.StatusUnauthorized, gin.H{"error": "no user in context"})
		return
	}
	g.JSON(http.StatusOK, gin.H{"user_data": user})
}
