package main

import (
	"net/http"
	"os"
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
		AllowOrigins:     []string{allowedOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
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
		accessToken, err1 := g.Cookie("access_token")
		refreshToken, err2 := g.Cookie("refresh_token")
		if err1 != nil || err2 != nil {
			container.Logger.Error("[authMiddleware] No access or refresh token")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		claims := jwt.MapClaims{}
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
		token, err := jwt.ParseWithClaims(accessToken, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err == nil && token.Valid {
			g.Set("user", claims)
			g.Next()
			return
		}

		newSession, err := container.Supabase.client.Auth.RefreshUser(g, accessToken, refreshToken)
		if err != nil {
			container.Logger.Error("[authMiddleware] Invalid or expired tokens")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		setCookie(g, "access_token", newSession.AccessToken, newSession.ExpiresIn, true)
		setCookie(g, "refresh_token", newSession.RefreshToken, 60*60*24*30, true)

		claims = jwt.MapClaims{}
		token, err = jwt.ParseWithClaims(newSession.AccessToken, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			container.Logger.Error("[authMiddleware] Invalid tokens after refresh")
			g.AbortWithStatusJSON(http.StatusUnauthorized, nil)
			return
		}

		g.Set("user", claims)
		g.Next()
	}
}
