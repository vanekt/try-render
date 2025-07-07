package main

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func corsMiddleware() gin.HandlerFunc {
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	if allowedOrigin == "" {
		return gin.HandlerFunc(func(c *gin.Context) {
			c.Next()
		})
	}

	return cors.New(cors.Config{
		AllowOrigins: []string{allowedOrigin},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		MaxAge:       12 * time.Hour,
	})
}

func loggingMiddleware() gin.HandlerFunc {
	return gin.Logger()
}

func recoveryMiddleware() gin.HandlerFunc {
	return gin.Recovery()
}

func authMiddleware(container *Container) gin.HandlerFunc {
	return func(g *gin.Context) {
		authHeader := g.GetHeader("Authorization")
		if authHeader == "" {
			container.Logger.Error("[authMiddleware] No Authorization header")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			container.Logger.Error("[authMiddleware] Invalid Authorization header format")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		accessToken := parts[1]

		claims := jwt.MapClaims{}
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
		token, err := jwt.ParseWithClaims(accessToken, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			container.Logger.Error("[authMiddleware] Invalid or expired token")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		g.Set("user", claims)
		g.Next()
	}
}
