require 'open-uri'
require "nokogiri"

#hpのhtmlをoprn-urlで取得するclass

class HP_html
    
    def initialize(url = nil)
        @url = url

        if @url == nil
            html = open('HP.html').read
        elsif @url == "program"
            html = open('program.html').read
        else
            html = URI.open(@url).read
        end
        @html = html

    end
    attr_reader :url, :html

    # def get_html
    #     if @url == nil
    #         html = open('HP.html').read
    #     else
    #         html = URI.open(@url).read
    #     end
    #     @html = html
    # end
    # attr_reader :html

    def nokogiri
        nokogiri = Nokogiri::HTML.parse(@html)
        return nokogiri
    end
end