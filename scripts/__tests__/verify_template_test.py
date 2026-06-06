import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[2]
VERIFY_TEMPLATE = REPO_ROOT / "scripts" / "verify_template.py"

spec = importlib.util.spec_from_file_location("verify_template", VERIFY_TEMPLATE)
verify_template = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_template)


class CocoaPodsCdnTest(unittest.TestCase):
    def test_ios_verify_invokes_cli_with_pod_repo_update_flag(self):
        self.assertEqual(
            verify_template.IOS_VERIFY_RUN_COMMAND,
            ["pnpm", "exec", "sparkling-app-cli", "run:ios", "--copy", "--pod-repo-update"],
        )
        self.assertNotIn("--", verify_template.IOS_VERIFY_RUN_COMMAND)

    def test_read_json_url_uses_cocoapods_user_agent(self):
        captured = {}

        class Response:
            def __enter__(self):
                return self

            def __exit__(self, _exc_type, _exc_value, _traceback):
                return False

            def read(self):
                return b'{"ok": true}'

        def fake_urlopen(req, timeout):
            captured["user_agent"] = req.get_header("User-agent")
            captured["timeout"] = timeout
            return Response()

        with patch.object(verify_template.urllib.request, "urlopen", fake_urlopen):
            self.assertEqual(verify_template.read_json_url("https://example.test/spec.json"), {"ok": True})

        self.assertEqual(captured["user_agent"], "CocoaPods/1.16.2")
        self.assertEqual(captured["timeout"], 30)

    def test_cocoapods_cdn_spec_url_uses_md5_sharded_path(self):
        self.assertEqual(
            verify_template.cocoapods_cdn_spec_url("SparklingMethod", "2.1.0-rc.26"),
            "https://cdn.cocoapods.org/Specs/0/e/8/SparklingMethod/2.1.0-rc.26/SparklingMethod.podspec.json",
        )

    def test_cocoapods_cdn_versions_url_uses_md5_sharded_path(self):
        self.assertEqual(
            verify_template.cocoapods_cdn_versions_url("SparklingMethod"),
            "https://cdn.cocoapods.org/all_pods_versions_0_e_8.txt",
        )

    def test_cdn_spec_ready_requires_template_sparkling_method_subspecs(self):
        spec_json = {
            "name": "SparklingMethod",
            "version": "2.1.0-rc.26",
            "subspecs": [
                {"name": "Core"},
                {"name": "Lynx"},
                {"name": "DIProvider"},
                {"name": "Debug"},
            ],
        }

        ready, reason = verify_template.cocoapods_cdn_spec_ready(
            "SparklingMethod",
            "2.1.0-rc.26",
            fetch_json=lambda _url: spec_json,
            fetch_text=lambda _url: "SparklingMethod/2.1.0-rc.25/2.1.0-rc.26\n",
        )

        self.assertTrue(ready, reason)

    def test_cdn_spec_ready_rejects_missing_version_index(self):
        spec_json = {
            "name": "SparklingMethod",
            "version": "2.1.0-rc.29",
            "subspecs": [
                {"name": "Core"},
                {"name": "Lynx"},
                {"name": "DIProvider"},
                {"name": "Debug"},
            ],
        }

        ready, reason = verify_template.cocoapods_cdn_spec_ready(
            "SparklingMethod",
            "2.1.0-rc.29",
            fetch_json=lambda _url: spec_json,
            fetch_text=lambda _url: "SparklingMethod/2.1.0-rc.27/2.1.0-rc.28\n",
        )

        self.assertFalse(ready)
        self.assertIn("versions index missing 2.1.0-rc.29", reason)

    def test_cdn_spec_ready_rejects_stale_sparkling_method_subspecs(self):
        spec_json = {
            "name": "SparklingMethod",
            "version": "2.1.0-rc.26",
            "subspecs": [
                {"name": "Core"},
                {"name": "Lynx"},
            ],
        }

        ready, reason = verify_template.cocoapods_cdn_spec_ready(
            "SparklingMethod",
            "2.1.0-rc.26",
            fetch_json=lambda _url: spec_json,
            fetch_text=lambda _url: "SparklingMethod/2.1.0-rc.26\n",
        )

        self.assertFalse(ready)
        self.assertIn("DIProvider", reason)


if __name__ == "__main__":
    unittest.main()
