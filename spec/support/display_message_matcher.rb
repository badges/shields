module DisplayMessageMatcher

  def display_message(command, message)
    DisplayMessageMatcher::DisplayMessage.new command, message
  end

  class DisplayMessage
    def initialize(command, message)
      @command = command
      @message = message
    end

    def matches?(given_proc)
      displayed_expected_message = false
      @given_messages = []

      @command.should_receive(:display).
        any_number_of_times do |message, newline|
        @given_messages << message
        displayed_expected_message = displayed_expected_message ||
          message == @message
      end

      given_proc.call

      displayed_expected_message
    end

    def failure_message
      "expected #{ @command } to display the message #{ @message.inspect } but #{ given_messages }"
    end

    def negative_failure_message
      "expected #{ @command } to not display the message #{ @message.inspect } but it was displayed"
    end

    private

      def given_messages
        if @given_messages.empty?
          'no messages were displayed'
        else
          formatted_given_messages = @given_messages.map(&:inspect).join ', '
          "the follow messages were displayed: #{ formatted_given_messages }"
        end
      end

  end
end