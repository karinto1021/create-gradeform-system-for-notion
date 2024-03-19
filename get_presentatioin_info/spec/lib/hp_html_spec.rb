# require 'spec_helper'
require 'HP_html'
require "open-uri"
require "nokogiri"

RSpec::describe HP_html do
    describe 'HP_html' do

        url = 'https://ken.ieice.org/ken/search/index.php?instsoc=IEICE-C&tgid=IEICE-MW&year=0&region=0&sch1=1&schkey=&pnum=0&psize=2&psort=0&layout=&lang=&term=&submit_public_schedule_instsoc=%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E6%A4%9C%E7%B4%A2&pskey=&ps1=1&ps2=1&ps3=1&ps4=1&ps5=1&search_mode=form'
        

        it 'new' do
            html = HP_html.new(url)
            expect(html.url).to eq url
            expect(html.html).to eq URI.open(url).read
            html2 = HP_html.new()
            expect(html2.url).to eq nil
            expect(html2.html).to eq open('HP.html').read
        end

        it 'nokogiri' do
            html = HP_html.new()
            expect(html.nokogiri.title).to eq Nokogiri::HTML.parse(html.html).title
        end

    end
end

