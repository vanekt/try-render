package main

import (
	"context"
	"os"

	supa "github.com/nedpals/supabase-go"
)

type SupabaseService struct {
	client *supa.Client
}

func NewSupabaseService() *SupabaseService {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	client := supa.CreateClient(url, key)
	return &SupabaseService{client: client}
}

func (s *SupabaseService) LoginOTP(ctx context.Context, email string) error {
	return s.client.Auth.SendMagicLink(ctx, email)
}

func (s *SupabaseService) VerifyOTP(ctx context.Context, email, code string) (*supa.AuthenticatedDetails, error) {
	return s.client.Auth.VerifyOtp(ctx, supa.VerifyEmailOtpCredentials{
		Type:       supa.EmailOtpTypeEmail,
		Email:      email,
		Token:      code,
		RedirectTo: "/",
	})
}

func (s *SupabaseService) SignOut(ctx context.Context, accessToken string) error {
	return s.client.Auth.SignOut(ctx, accessToken)
}
