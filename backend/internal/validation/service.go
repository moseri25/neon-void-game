package validation

import (
	"errors"
	"math"
)

type CaptureEvent struct {
	PlayerID    string  `json:"player_id"`
	AreaPercent float64 `json:"area_percent"`
	Combo       int     `json:"combo"`
	Timestamp   int64   `json:"timestamp"`
}

type GameResult struct {
	PlayerID        string  `json:"player_id"`
	TotalScore      int64   `json:"total_score"`
	LevelsCompleted int     `json:"levels_completed"`
	CapturePercent  float64 `json:"capture_percent"`
	DurationMs      int64   `json:"duration_ms"`
	Captures        []CaptureEvent `json:"captures"`
}

func ValidateCaptureEvent(event CaptureEvent) error {
	if event.AreaPercent < 0 || event.AreaPercent > 1.0 {
		return errors.New("area percent out of range")
	}
	if event.AreaPercent > 0.5 {
		return errors.New("single capture exceeds maximum threshold")
	}
	if event.Combo < 0 || event.Combo > 20 {
		return errors.New("invalid combo value")
	}
	if event.Timestamp <= 0 {
		return errors.New("invalid timestamp")
	}
	return nil
}

func ValidateGameResult(result GameResult) error {
	if result.TotalScore < 0 {
		return errors.New("negative total score")
	}
	if result.LevelsCompleted < 0 || result.LevelsCompleted > 100 {
		return errors.New("invalid levels completed")
	}
	if result.CapturePercent < 0 || result.CapturePercent > 1.0 {
		return errors.New("invalid capture percent")
	}
	if result.DurationMs < 0 {
		return errors.New("invalid duration")
	}

	// Cross-validate: score should be roughly proportional to captures
	if len(result.Captures) > 0 {
		totalCapture := 0.0
		lastTimestamp := int64(0)
		for _, c := range result.Captures {
			if err := ValidateCaptureEvent(c); err != nil {
				return err
			}
			if c.Timestamp < lastTimestamp {
				return errors.New("captures not in chronological order")
			}
			lastTimestamp = c.Timestamp
			totalCapture += c.AreaPercent
		}

		// Score rate limit: max ~50k per second
		if result.DurationMs > 0 {
			scorePerSecond := float64(result.TotalScore) / (float64(result.DurationMs) / 1000.0)
			if scorePerSecond > 50000 {
				return errors.New("score rate exceeds maximum threshold")
			}
		}

		// Total capture should roughly match reported percent
		if math.Abs(totalCapture-result.CapturePercent) > 0.15 {
			return errors.New("capture total mismatch")
		}
	}

	return nil
}
