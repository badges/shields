require "bundler/gem_tasks"
require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << "lib"
  t.test_files = FileList['lib/test/**/*_spec.rb']
end

task :default => [:test]
