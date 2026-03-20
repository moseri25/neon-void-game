package leaderboard

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"

	"github.com/neon-void/backend/internal/auth"
)

type Handler struct {
	redis *redis.Client
}

func NewHandler(redis *redis.Client) *Handler {
	return &Handler{redis: redis}
}

type SubmitScoreRequest struct {
	Score           float64 `json:"score"`
	LevelsCompleted int     `json:"levels_completed"`
	CapturePercent  float64 `json:"capture_percent"`
	DurationMs      int64   `json:"duration_ms"`
}

type LeaderboardResponse struct {
	Entries []ScoreEntry `json:"entries"`
	Total   int64        `json:"total"`
}

func (h *Handler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := int64(100)
	offset := int64(0)

	if limitStr != "" {
		if v, err := strconv.ParseInt(limitStr, 10, 64); err == nil && v > 0 && v <= 500 {
			limit = v
		}
	}
	if offsetStr != "" {
		if v, err := strconv.ParseInt(offsetStr, 10, 64); err == nil && v >= 0 {
			offset = v
		}
	}

	entries, err := GetTopScores(r.Context(), h.redis, limit, offset)
	if err != nil {
		log.Error().Err(err).Msg("failed to get leaderboard")
		http.Error(w, `{"error":"failed to fetch leaderboard"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.redis.ZCard(r.Context(), leaderboardKey).Result()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LeaderboardResponse{
		Entries: entries,
		Total:   total,
	})
}

func (h *Handler) SubmitScore(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req SubmitScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Score < 0 || req.Score > 100_000_000 {
		http.Error(w, `{"error":"invalid score"}`, http.StatusBadRequest)
		return
	}

	if err := InsertScore(r.Context(), h.redis, claims.UserID, req.Score); err != nil {
		log.Error().Err(err).Str("user_id", claims.UserID).Msg("failed to insert score")
		http.Error(w, `{"error":"failed to submit score"}`, http.StatusInternalServerError)
		return
	}

	rank, _ := GetPlayerRank(r.Context(), h.redis, claims.UserID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "ok",
		"user_id": claims.UserID,
		"score":   req.Score,
		"rank":    rank,
	})
}
