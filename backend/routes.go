package main

import (
	"net/http"
	"os"

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

type File struct {
	Name string `json:"name"`
	Url  string `json:"url"`
	Path string `json:"path"`
}

type UploadRequest struct {
	Message string `json:"message"`
	Files   []File `json:"files"`
}

var bucketName = os.Getenv("SUPABASE_BUCKET_NAME")
var expiresIn = 60 * 60

func handleUpload(g *gin.Context, c *Container) {
	var req UploadRequest
	if err := g.ShouldBindJSON(&req); err != nil {
		g.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	resultFiles := make([]File, len(req.Files))
	for i := 0; i < len(req.Files); i++ {
		resp, err := c.Supabase.client.Storage.CreateSignedUrl(bucketName, req.Files[i].Path, expiresIn)
		if err != nil {
			c.Logger.Error("cannot create signedUrl: %v", err)
			g.JSON(http.StatusBadGateway, nil)
			return
		}

		resultFiles[i] = File{
			Name: req.Files[i].Name,
			Path: req.Files[i].Path,
			Url:  resp.SignedURL,
		}
	}

	g.JSON(http.StatusOK, gin.H{"success": true, "files": resultFiles})
}
