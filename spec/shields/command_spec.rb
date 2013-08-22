require "shields/command"

describe Shields::Command do
  before do
    Shields::Command.load
  end

  it "correctly resolves commands" do
    class Shields::Command::Test; end
    class Shields::Command::Test::Multiple; end

    require "shields/command/help"
    require "shields/command/generate"

    Shields::Command.parse("unknown").should be_nil
    Shields::Command.parse("generate").should include(:klass => Shields::Command::Generate, :method => :index)
  end
end