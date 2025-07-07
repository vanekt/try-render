package main

import (
	"os"

	supa "github.com/nedpals/supabase-go"
)

type SupabaseService struct {
	client *supa.Client
}

func NewSupabaseService() *SupabaseService {
	return &SupabaseService{
		client: supa.CreateClient(
			os.Getenv("SUPABASE_URL"),
			os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		),
	}
}
