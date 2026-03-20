package leaderboard

import (
	"context"

	"github.com/redis/go-redis/v9"
)

const leaderboardKey = "global_leaderboard"

type ScoreEntry struct {
	UserID   string  `json:"user_id"`
	Username string  `json:"username"`
	Score    float64 `json:"score"`
	Rank     int64   `json:"rank"`
}

func InsertScore(ctx context.Context, client *redis.Client, userID string, score float64) error {
	// Only update if new score is higher (NX won't work, use LT for conditional)
	return client.ZAddGT(ctx, leaderboardKey, redis.Z{
		Score:  score,
		Member: userID,
	}).Err()
}

func GetTopScores(ctx context.Context, client *redis.Client, limit, offset int64) ([]ScoreEntry, error) {
	results, err := client.ZRevRangeWithScores(ctx, leaderboardKey, offset, offset+limit-1).Result()
	if err != nil {
		return nil, err
	}

	entries := make([]ScoreEntry, 0, len(results))
	for i, z := range results {
		entries = append(entries, ScoreEntry{
			UserID: z.Member.(string),
			Score:  z.Score,
			Rank:   offset + int64(i) + 1,
		})
	}
	return entries, nil
}

func GetPlayerRank(ctx context.Context, client *redis.Client, userID string) (int64, error) {
	rank, err := client.ZRevRank(ctx, leaderboardKey, userID).Result()
	if err != nil {
		return -1, err
	}
	return rank + 1, nil
}

func GetPlayerScore(ctx context.Context, client *redis.Client, userID string) (float64, error) {
	return client.ZScore(ctx, leaderboardKey, userID).Result()
}
