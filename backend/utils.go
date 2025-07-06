package main

import (
	"github.com/gin-gonic/gin"
)

func setCookie(
	g *gin.Context,
	name string,
	value string,
	maxAge int,
	httpOnly bool,
) {
	secure := false // TODO
	g.SetCookie(name, value, maxAge, "/", "", secure, httpOnly)
}
