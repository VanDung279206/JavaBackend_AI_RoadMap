from pathlib import Path
import importlib.util, unittest

ROOT = Path(__file__).resolve().parents[2]
def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT/'scripts'/(name+'.py'))
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

class RepositoryIntegrityTests(unittest.TestCase):
    def test_conflict_markers_are_rejected_but_quoted_examples_are_allowed(self):
        scanner = module('check_conflicts')
        broken = 'before\n<<<<<<< HEAD\nleft\n=======\nright\n>>>>>>> branch\n'
        self.assertEqual(scanner.marker_lines(broken), [2, 4, 6])
        self.assertEqual(scanner.marker_lines('example = "<<<<<<< HEAD"\n'), [])

    def test_repository_contains_no_unresolved_merge(self):
        self.assertEqual(module('check_conflicts').inspect(), [])

    def test_every_upgrade_and_restore_input_is_in_the_repository(self):
        for file in module('check_database').required_sql_files():
            self.assertTrue((ROOT/file).is_file(), file)

if __name__ == '__main__': unittest.main()
