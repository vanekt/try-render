package main

import (
	"fmt"
	"os"

	supa "github.com/supabase-community/supabase-go"
)

type SupabaseService struct {
	client *supa.Client
}

func NewSupabaseService() *SupabaseService {
	client, err := supa.NewClient(
		os.Getenv("SUPABASE_URL"),
		os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		&supa.ClientOptions{},
	)

	if err != nil {
		fmt.Println("cannot initalize supabase client", err)
	}

	return &SupabaseService{
		client,
	}
}
