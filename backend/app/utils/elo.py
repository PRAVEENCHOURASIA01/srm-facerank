"""
ELO Rating System
K-factor of 32 is standard for most applications.
Expected score formula: E = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
New rating: R' = R + K * (actual_score - expected_score)
"""

K_FACTOR = 32


def expected_score(rating_a: float, rating_b: float) -> float:
    """Expected score for player A against player B."""
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


def calculate_elo(
    winner_rating: float, loser_rating: float
) -> tuple[float, float]:
    """
    Returns (new_winner_rating, new_loser_rating).
    Winner gets actual_score=1, loser gets actual_score=0.
    """
    expected_winner = expected_score(winner_rating, loser_rating)
    expected_loser = expected_score(loser_rating, winner_rating)

    new_winner = winner_rating + K_FACTOR * (1 - expected_winner)
    new_loser = loser_rating + K_FACTOR * (0 - expected_loser)

    return round(new_winner, 2), round(new_loser, 2)