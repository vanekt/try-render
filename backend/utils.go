package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func setCookie(
	g *gin.Context,
	name string,
	value string,
	maxAge int,
	httpOnly bool,
) {
	domain := os.Getenv("COOKIES_DOMAIN")
	secure := false
	sameSite := http.SameSiteDefaultMode

	if domain != "" {
		secure = true
		if sameSite == 0 {
			sameSite = http.SameSiteNoneMode
		}
	} else {
		if sameSite == 0 {
			sameSite = http.SameSiteLaxMode
		}
	}

	g.SetSameSite(sameSite)
	g.SetCookie(name, value, maxAge, "/", domain, secure, httpOnly)
}
