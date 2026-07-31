"""Cobre a thread-safety do RateLimiter e do BackoffController (ponto #1
da issue #52). collect_products_by_query roda páginas em paralelo via
ThreadPoolExecutor, então esses controladores globais precisam de lock."""
import threading
import time

import pytest

from tests.factories import BackoffControllerFactory, RateLimiterFactory


@pytest.mark.unit
def test_controladores_tem_lock():
    rl = RateLimiterFactory()
    bo = BackoffControllerFactory()
    assert isinstance(rl._lock, type(threading.Lock()))
    assert isinstance(bo._lock, type(threading.Lock()))


@pytest.mark.unit
def test_rate_limiter_serializa_threads():
    # 5 threads, intervalo 0.05s. A 1ª passa direto; as 4 seguintes ficam
    # serializadas pelo lock => tempo total >= ~4 * intervalo.
    interval = 0.05
    rl = RateLimiterFactory(min_interval=interval)

    barrier = threading.Barrier(5)

    def worker():
        barrier.wait()
        rl.wait()

    threads = [threading.Thread(target=worker) for _ in range(5)]

    start = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    elapsed = time.time() - start

    assert elapsed >= 4 * interval * 0.8  # margem p/ jitter de scheduling


@pytest.mark.unit
def test_backoff_concorrente_nao_corrompe_estado():
    # Muitas threads alternando error/success não devem estourar exceção
    # nem deixar current_delay fora dos limites.
    bo = BackoffControllerFactory(base_delay=0.01, max_delay=0.1, factor=2.0)

    def worker():
        for _ in range(200):
            bo.error()
            bo.success()

    threads = [threading.Thread(target=worker) for _ in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert bo.base_delay <= bo.current_delay <= bo.max_delay


@pytest.mark.unit
def test_backoff_error_cresce_e_satura(mocker):
    bo = BackoffControllerFactory(base_delay=1.0, max_delay=4.0, factor=2.0)

    bo.error()
    assert bo.current_delay == 2.0
    bo.error()
    assert bo.current_delay == 4.0
    bo.error()
    assert bo.current_delay == 4.0  # satura no max_delay
    bo.success()
    assert bo.current_delay == 1.0  # reseta para base_delay


@pytest.mark.unit
def test_rate_limiter_respeita_intervalo_sequencial(mocker):
    interval = 0.05
    rl = RateLimiterFactory(min_interval=interval)

    sleeps = []
    mocker.patch("time.sleep", side_effect=lambda d: sleeps.append(d))

    rl.wait()  # primeira: last_request=0, sem espera relevante
    rl.wait()  # segunda: deve dormir ~interval

    assert any(s > 0 for s in sleeps)
