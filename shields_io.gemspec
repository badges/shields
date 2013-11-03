# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'shields_io/version'

Gem::Specification.new do |spec|
  spec.name          = "shields_io"
  spec.version       = ShieldsIo::VERSION
  spec.authors       = ["Ori Pekelman"]
  spec.email         = ["ori@pekelman.com"]
  spec.description   = %q{Small gem to generate shields (travis, code climate, etc..)}
  spec.summary       = %q{Small gem to generate shields (travis, code climate, etc..}
  spec.homepage      = "http://shields.io/"
  spec.license       = "Public Domain"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "minitest"
  spec.add_dependency "erubis", "~> 2.7.0"
  spec.add_dependency "mini_magick", "~> 3.6.0"
  spec.add_dependency "slop", "~> 3.4.0"
end
