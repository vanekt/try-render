package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		log.Println("🏓 Ping...")
		time.Sleep(3 * time.Second)
		log.Println("🏓 Pong")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"result": "pong"})
	})
	http.ListenAndServe(":8080", nil)
}
