package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"

	"github.com/neon-void/backend/internal/auth"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" || origin == "" || origin == "https://neonvoid.io"
	},
}

func HandleUpgrade(hub *Hub, jwtService *auth.JWTService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Auth via query param
		token := r.URL.Query().Get("token")
		userID := "anonymous"
		if token != "" {
			claims, err := jwtService.ValidateToken(token)
			if err != nil {
				log.Warn().Err(err).Msg("invalid ws auth token")
			} else {
				userID = claims.UserID
			}
		}

		roomID := r.URL.Query().Get("room")

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error().Err(err).Msg("ws upgrade failed")
			return
		}

		client := NewClient(hub, conn, userID, roomID)
		hub.register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
