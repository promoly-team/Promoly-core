import pytest

from api.utils.pricing import calculate_discount

pytestmark = pytest.mark.unit


class TestCalculateDiscount:
    def test_normal(self):
        assert calculate_discount(80.0, 100.0) == 20.0

    def test_rounding(self):
        assert calculate_discount(99.0, 149.0) == round(50 * 100 / 149, 2)

    def test_no_previous(self):
        assert calculate_discount(80.0, None) is None

    def test_no_current(self):
        assert calculate_discount(None, 100.0) is None

    def test_previous_not_higher(self):
        assert calculate_discount(100.0, 100.0) is None

    def test_previous_lower(self):
        assert calculate_discount(120.0, 100.0) is None
