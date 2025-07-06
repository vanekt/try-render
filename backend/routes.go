package main

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func bindRoute(handler func(*gin.Context, *Container), container *Container) gin.HandlerFunc {
	return func(c *gin.Context) {
		handler(c, container)
	}
}

type LoginOTPRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func handleLoginOTP(g *gin.Context, c *Container) {
	var req LoginOTPRequest
	if err := g.ShouldBindJSON(&req); err != nil {
		c.Logger.Error("[handleLoginOTP] Invalid request", err)
		g.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err := c.Supabase.LoginOTP(context.Background(), req.Email)
	if err != nil {
		c.Logger.Error("[handleLoginOTP] Failed to send OTP", err)
		g.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send OTP"})
		return
	}

	c.Logger.Info("[handleLoginOTP] OTP sent to", req.Email)
	g.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

type ConfirmOTPRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func handleConfirmOTP(g *gin.Context, c *Container) {
	var req ConfirmOTPRequest
	if err := g.ShouldBindJSON(&req); err != nil {
		c.Logger.Error("[handleConfirmOTP] Invalid request", err)
		g.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	result, err := c.Supabase.VerifyOTP(context.Background(), req.Email, req.Code)
	if err != nil {
		c.Logger.Error("[handleConfirmOTP] Failed to verify OTP", err)
		g.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify OTP"})
		return
	}

	setCookie(g, "access_token", result.AccessToken, result.ExpiresIn, true)
	setCookie(g, "refresh_token", result.RefreshToken, 60*60*24*30, true)

	g.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

func handleLogout(g *gin.Context, c *Container) {
	accessToken, err := g.Cookie("access_token")
	if err != nil {
		c.Logger.Error("[handleLogout] No access token", err)
		g.JSON(http.StatusUnauthorized, nil)
		return
	}

	err = c.Supabase.SignOut(g, accessToken)
	if err != nil {
		c.Logger.Error("[handleLogout] Failed to sign out in supabase", err)
		g.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign out"})
		return
	}

	setCookie(g, "access_token", "", -1, true)
	setCookie(g, "refresh_token", "", -1, true)

	g.JSON(http.StatusOK, nil)
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
