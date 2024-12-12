require "nokogiri"
#nokogiriのデータを扱うclass

class NokogiriData
    # 初期化 nokogiriされたデータをインスタンス変数に格納
    def initialize(nokogiri)
        @nokogiri = nokogiri
    end
    attr_reader :nokogiri
    

    # プログラム一覧のHPから最新の月の開催プログラムのURLを取得
    # プログラム一覧のurlを引数とする(年度が変わった時のみ変更すればよい)
    def self.program_url(url = nil)
        #最も新しいプログラムのURLを取得
        # links = @nokogiri.css('a')
        if url != nil
            links = HP_html.new(url).nokogiri.css('a')
            program_url = links.select { |l| l.text == "開催プログラム"}.last.attribute('href').value
        else
            links = HP_html.new().nokogiri.css('a')
            program_url = links.select { |l| l.text == "開催プログラム"}.last.attribute('href').value
        end
        return program_url
    end

    # 著者から発表者を取得
    def self.get_presenter(data)
        name = nil
        if data.include? "（"
            data.split("・").each do |d|
                if d.start_with? "○"
                    name, syozoku = d.gsub("○", "").split(/[（）]/)
                    return [name, syozoku] if syozoku
                elsif name
                    _, syozoku = d.split(/[（）]/)
                    return [name, syozoku] if syozoku
                end
            end
        else
            name = data&.gsub("○", "")
            return [name, nil]
        end
    end

    # プログラムのあるHPのデータからプログラムのtableを取得
    def get_program_table
        #htmlからprogramのtableを取り出せること
        program_table = []
        days = []
        day = nil
        @nokogiri.css('a').each do |a|
            if a.attribute('name')&.value == "program"
                a.next_element.css('b').each do |b|
                    days.push(b)
                end

                a.next_element.css('td').each do |td|
                    days.each do |d|
                        if td.text == d.text
                            day = d.text.split(" ").first
                        end
                    end

                    100.times do |i|
                        if td.text.include?("(#{i+1})")
                            number = td&.text
                            time = td&.next_element&.text
                            title = td&.next_element&.next_element&.text
                            authors = td&.next_element&.next_element&.next_element&.text
                            program_table.push([number.delete("[変更あり]"), day, time.delete("[変更あり]"), title, authors])
                        end
                    end
                end
            end
        end
        return program_table
    end

    # タイトルと資料番号１つになっているデータから資料番号を取得
    def self.get_document(data)
        document = nil

        data.split(" ").each do |d|
            if d.include?("MW") && !d.include?("MWP")
                document = d
            end
        end
        return document
    end

    # タイトルと資料番号１つになっているデータからタイトルを取得
    def self.get_title(data)
        title = nil
        title = data.split("   ").first.strip
        return title
    end

    # とり出したプログラムのtableから必要なデータにする
    def get_need_data
        program_table = get_program_table

        # 日付，場所，座長のtableを削除
        # (時間，タイトル，著者)がnilのものを削除
        program_table.each do |data|
            if data[2].nil? || data[3].nil? || data[4].nil?
                program_table.delete(data)
            end
        end

        need_data = []
        counter = 0
        program_table.each do |data|
            counter += 1

            number = data[0]
            day = data[1]
            time = data[2]
            title_document = data[3]
            authors = data[4]
            
            if number[-2] == "M" && number[-1] == "W"
                title = NokogiriData.get_title(title_document)
                document = NokogiriData.get_document(title_document)
                presenter, syozoku = NokogiriData.get_presenter(authors)
                need_data.push([number.delete("( )MW").to_i, day, time, title, document, presenter, syozoku])
            elsif number[-1] == ")"
                title = NokogiriData.get_title(title_document)
                document = NokogiriData.get_document(title_document)
                presenter, syozoku = NokogiriData.get_presenter(authors)
                need_data.push([number.delete("( )").to_i, day, time, title, document, presenter, syozoku]) 
            end
        end

        return need_data
    end
end
