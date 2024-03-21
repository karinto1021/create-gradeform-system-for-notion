require './lib/hp_html'
require './lib/nokogiri_data'
require "notion_ruby_mapping"
include NotionRubyMapping

NotionRubyMapping.configure { |config| config.token = "secret_*********" }

Codeblock_nendo_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
codeblock_month_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
# codeblock_url_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

program_db_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
presentation_db_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
presenter_db_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
candidate_db_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

# 年度を取得
cb_nendo = CodeBlock.find(Codeblock_nendo_id)
nendo = cb_nendo.rich_text_array.full_text

# 何月開催かcodeblockから取得
cb_month = CodeBlock.find(codeblock_month_id)
month = cb_month.rich_text_array.full_text

# # HPのリンクが書いてあるcodeblockからurlを取得
# cb_url = CodeBlock.find(codeblock_url_id)
# program_url = cb_url.rich_text_array.full_text
# # pp program_url

# # 最新の月のプログラムurlを取得
# new_url = NokogiriData.program_url(program_url)
# pp new_url
new_url = ARGV.first

sleep 1
# urlからpresentation_db用のデータを取得
presentation_data = NokogiriData.new(HP_html.new(new_url).nokogiri).get_need_data
# pp presentation_data


# program_hashを作る
program_db = Database.find(program_db_id)
program = program_db.query_database
program_hash = program.to_a.each_with_object({}){ |p, h|h[p.properties["実施月"].full_text] = p.id }

# dicidePageに今年度のページがあるか確認
candidate_db = Database.find(candidate_db_id)
candidate = candidate_db.query_database
candidate_hash = candidate.to_a.each_with_object({}){ |c, h|h[c.properties["年度"].full_text] = c.id }

# 今年度のページがなければ作成
if !(candidate_hash.include?(nendo))
    c_page = candidate_db.create_child_page do |p, pc|
        pc["年度"] << nendo
    end
    candidate_hash[nendo] = c_page.id
end

# program_dbに今月のページがあるか確認し、なければ作成
# あれば既に追加済みなのでpresentationの追加も行わない
if !(program_hash.include?(month))
    p_page = program_db.create_child_page do |p, pc|
        pc["実施月"] << month
        pc["年度"].add_relation(candidate_hash[nendo])
    end
    program_hash[month] = p_page.id
    
    # presenter_hashを作る
    presenter_db = Database.find(presenter_db_id)
    presenter = presenter_db.query_database
    presenter_hash = presenter.to_a.each_with_object({}){ |p, h|h[p.properties["名前"].full_text] = p.id }

    # presentation_dbに送る
    presentation_db = Database.find(presentation_db_id)
    presentation_data.each do |pp|
        if !(presenter_hash.include?(pp[5] + "_" + nendo))
            page = presenter_db.create_child_page do |p, pc|
                pc["名前"] << pp[5] + "_" + nendo
                pc["所属"] << pp[6]
            end
            presenter_hash[pp[5] + "_" + nendo] = page.id
            # puts pp[5]
        end
        
        presentation_db.create_child_page do |p, pc|
            pc["発表番号"].number = pp[0]
            pc["発表日"] << pp[1]
            pc["発表時間"] << pp[2]
            pc["発表タイトル"] << pp[3]
            pc["資料番号"] << pp[4] if !(pp[4].nil?)
            pc["発表者"].add_relation(presenter_hash[pp[5] + "_" + nendo])
            pc["実施月"].add_relation(program_hash[month])
        end
        # puts pp[0]
        # puts "success"
    end
    puts "追加しました"
else
    puts "既に追加済みです"
end