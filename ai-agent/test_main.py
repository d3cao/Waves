import unittest
from unittest.mock import AsyncMock, patch

import httpx
from fastapi.testclient import TestClient
import main


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def ollama(self, response=None, error=None):
        mock = AsyncMock()
        mock.__aenter__.return_value = mock
        if response is not None:
            mock.get.return_value = httpx.Response(200, json=response, request=httpx.Request("GET", "http://localhost/api/tags"))
        if error:
            mock.get.side_effect = error
        return mock

    def test_health_ready_and_missing_model(self):
        for models, available in [([{"name": "llama3.2:1b"}], True), ([], False), ([{"name": "other"}], False)]:
            with patch.object(main.httpx, "AsyncClient", return_value=self.ollama({"models": models})):
                response = self.client.get("/health")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), {"status": "available" if available else "unavailable", "ollama": True, "model": available})

    def test_health_offline_and_malformed(self):
        for mock in [self.ollama(error=httpx.ConnectError("offline")), self.ollama({"models": None}), self.ollama([])]:
            with patch.object(main.httpx, "AsyncClient", return_value=mock):
                self.assertEqual(self.client.get("/health").json()["status"], "unavailable")

    def test_simplify_contract_unchanged(self):
        self.assertEqual(self.client.post("/simplify", json={"texto": "curto"}).status_code, 422)
        mock = self.ollama()
        mock.post.return_value = httpx.Response(200, json={"response": '{"texto_simplificado":"Texto simples."}'}, request=httpx.Request("POST", "http://localhost/api/generate"))
        with patch.object(main.httpx, "AsyncClient", return_value=mock):
            response = self.client.post("/simplify", json={"texto": "Um texto complexo para testar."})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"texto_simplificado": "Texto simples."})
        self.assertEqual(mock.post.call_args.kwargs["json"]["model"], "llama3.2:1b")

    def test_simplify_upstream_errors(self):
        for error, status in [(httpx.ConnectError("offline"), 502)]:
            mock = self.ollama()
            mock.post.side_effect = error
            with patch.object(main.httpx, "AsyncClient", return_value=mock):
                self.assertEqual(self.client.post("/simplify", json={"texto": "Texto original suficiente."}).status_code, status)

    def test_simplify_invalid_generated_json(self):
        mock = self.ollama()
        mock.post.return_value = httpx.Response(200, json={"response": "JSON inválido"}, request=httpx.Request("POST", "http://localhost/api/generate"))
        with patch.object(main.httpx, "AsyncClient", return_value=mock):
            self.assertEqual(self.client.post("/simplify", json={"texto": "Texto original suficiente."}).status_code, 422)


if __name__ == "__main__":
    unittest.main()
