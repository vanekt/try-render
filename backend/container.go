package main

type Container struct {
	Logger   *LoggerService
	Supabase *SupabaseService
}

func NewContainer() *Container {
	return &Container{
		Logger:   NewLoggerService(),
		Supabase: NewSupabaseService(),
	}
}
