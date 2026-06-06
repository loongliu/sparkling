import importlib.util
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VERIFY_TEMPLATE = REPO_ROOT / "scripts" / "verify_template.py"

spec = importlib.util.spec_from_file_location("verify_template", VERIFY_TEMPLATE)
verify_template = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify_template)


class CocoaPodsCdnTest(unittest.TestCase):
    def test_cocoapods_cdn_spec_url_uses_md5_sharded_path(self):
        self.assertEqual(
            verify_template.cocoapods_cdn_spec_url("SparklingMethod", "2.1.0-rc.26"),
            "https://cdn.cocoapods.org/Specs/0/e/8/SparklingMethod/2.1.0-rc.26/SparklingMethod.podspec.json",
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
            lambda _url: spec_json,
        )

        self.assertTrue(ready, reason)

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
            lambda _url: spec_json,
        )

        self.assertFalse(ready)
        self.assertIn("DIProvider", reason)


if __name__ == "__main__":
    unittest.main()
