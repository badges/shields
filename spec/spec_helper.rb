# See http://rubydoc.info/gems/rspec-core/RSpec/Core/Configuration
RSpec.configure do |config|
  config.treat_symbols_as_metadata_keys_with_true_values = true
  config.run_all_when_everything_filtered = true
  config.filter_run :focus

  config.order = 'random'
end

$stdin = File.new("/dev/null")

# ensure these are around for errors
# as their require is generally deferred

require "shields/cli"
require "fakefs/safe"
require 'tmpdir'

def prepare_command(klass)
  command = klass.new
  command.stub!(:ask).and_return("")
  command.stub!(:display)
  command.stub!(:hputs)
  command.stub!(:hprint)
  command
end

def execute(command_line)
  args = command_line.split(" ")
  command = args.shift

  Shields::Command.load
  object, method = Shields::Command.prepare_run(command, args)

  any_instance_of(Shields::Command::Base) do |base|
    stub(base).app.returns("example")
  end

  original_stdin, original_stderr, original_stdout = $stdin, $stderr, $stdout

  $stdin  = captured_stdin  = StringIO.new
  $stderr = captured_stderr = StringIO.new
  $stdout = captured_stdout = StringIO.new
  class << captured_stdout
    def tty?
      true
    end
  end

  begin
    object.send(method)
  rescue SystemExit
  ensure
    $stdin, $stderr, $stdout = original_stdin, original_stderr, original_stdout
    Shields::Command.current_command = nil
  end

  [captured_stderr.string, captured_stdout.string]
end

def any_instance_of(klass, &block)
  any_instance_of(klass, &block)
end

def run(command_line)
  capture_stdout do
    begin
      Shields::CLI.start(*command_line.split(" "))
    rescue SystemExit
    end
  end
end

alias shields run

def capture_stderr(&block)
  original_stderr = $stderr
  $stderr = captured_stderr = StringIO.new
  begin
    yield
  ensure
    $stderr = original_stderr
  end
  captured_stderr.string
end

def capture_stdout(&block)
  original_stdout = $stdout
  $stdout = captured_stdout = StringIO.new
  begin
    yield
  ensure
    $stdout = original_stdout
  end
  captured_stdout.string
end

def fail_command(message)
  raise_error(Shields::Command::CommandFailed, message)
end

module SandboxHelper
  def bash(cmd)
    `#{cmd}`
  end
end

require "shields/helpers"
module Shields::Helpers
  @home_directory = Dir.mktmpdir
  undef_method :home_directory
  def home_directory
    @home_directory
  end
end

require "support/display_message_matcher"

RSpec.configure do |config|
  config.include DisplayMessageMatcher
  config.before { Shields::Helpers.error_with_failure = false }
end
