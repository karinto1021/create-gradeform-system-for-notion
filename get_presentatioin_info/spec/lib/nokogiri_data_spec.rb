require 'hp_html'
require 'nokogiri_data'

RSpec::describe NokogiriData do
    describe 'NokogiriData' do
        it 'new' do
            noko = HP_html.new().nokogiri
            nokogiri_data = NokogiriData.new(noko)
            expect(nokogiri_data.nokogiri).to eq noko
        end

        it 'program_url' do #最も新しいプログラムのURLを取得
            # HP_url = "https://ken.ieice.org/ken/search/index.php?instsoc=IEICE-C&tgid=IEICE-MW&year=0&region=0&sch1=1&schkey=&pnum=0&psize=2&psort=0&layout=&lang=&term=&submit_public_schedule_instsoc=%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E6%A4%9C%E7%B4%A2&pskey=&ps1=1&ps2=1&ps3=1&ps4=1&ps5=1&search_mode=form"
            # noko = HP_html.new().nokogiri
            program_url = "https://ken.ieice.org/ken/program/index.php?tgs_regid=6e77841bf86a29fe682acb979a77f0e4012cd0254a204a7f0531e38643f4dbac&tgid=IEICE-MW"
            # nokogiri_data = NokogiriData.new(noko)
            expect(NokogiriData.program_url()).to eq program_url
        end

        it '発表者が取得できること' do
           data = [
            "○廣田明道・大島　毅・西原　淳・野々村博之・深沢　徹・稲沢良夫（三菱電機）",
            "○Weiyu Zhou・Koji Wada（UEC）・Kenichi Ohta（Bifröstec Inc.）",
            "○新納和樹・西村直志（京大）",
            "○田中雅宏（岐阜大）",
            "鈴木秀斗・○島崎仁司（京都工繊大）",
            "○平井　司（金沢工大）・竹本明寿也（東レ）・坂井尚貴（金沢工大）・野口健太・堀井新司（東レ）・伊東健治（金沢工大）",
            "○坂井尚貴・古谷尚季・廣瀬裕也・内山海渡・小松郁弥・伊東健治（金沢工大）",
            "○勝田慎平・三谷友彦・篠原真毅（京大）",
            "○湯川秀憲・関　竜哉・深沢　徹・稲沢良夫（三菱電機）",
            "山下周斗・○並川凌介・島崎仁司（京都工繊大）",
            "○安田秀史・上田哲也（京都工繊大）",
            "○塩見英久（阪大）"
            ]

            expect(data.map { |d| NokogiriData.get_presenter(d) }).to eq [
                %w[廣田明道 三菱電機],
                %w[Weiyu\ Zhou UEC],
                %w[新納和樹 京大],
                %w[田中雅宏  岐阜大],
                %w[島崎仁司 京都工繊大],
                %w[平井　司 金沢工大],
                %w[坂井尚貴 金沢工大],
                %w[勝田慎平 京大],
                %w[湯川秀憲 三菱電機],
                %w[並川凌介 京都工繊大],
                %w[安田秀史 京都工繊大],
                %w[塩見英久 阪大]
            ]
        end

        it 'htmlからprogramのtableを取り出せること' do
            noko = HP_html.new("program").nokogiri
            nokogiri_data = NokogiriData.new(noko)
            ans = [["(1)", "5月18日(木)", "14:45-15:10", "放熱性を考慮した導波管8合成器   MW2023-9", "○廣田明道・大島　毅・西原　淳・野々村博之・深沢　徹・稲沢良夫（三菱電機）"],
            ["(2)", "5月18日(木)", "15:10-15:35","A design method for miniaturized multiplexer based on a novel substrate integrated defect ground structure   MW2023-10","○Weiyu Zhou・Koji Wada（UEC）・Kenichi Ohta（Bifröstec Inc.）"],
            ["(3)", "5月18日(木)", "15:50-16:40", "［招待講演］isogeometric解析を用いたMaxwell方程式に対する種々の境界積分方程式の選点法による離散化   MW2023-11", "○新納和樹・西村直志（京大）"],       
            ["(4)", "5月18日(木)", "16:40-17:30", "［招待講演］導波路シミュレーションのための積分方程式に基づくモーメント法   MW2023-12", "○田中雅宏（岐阜大）"],
            ["(5)", "5月19日(金)", "10:00-10:25", "地中に埋めた920MHz帯ヘリカルアンテナの小型化   MW2023-13", "鈴木秀斗・○島崎仁司（京都工繊大）"],
            ["(6)", "5月19日(金)",  "10:25-10:50", "CNT-TFT GADを用いる920MHz帯レクテナ   MW2023-14", "○平井　司（金沢工大）・竹本明寿也（東レ）・坂井尚貴（金沢工大）・野口健太・堀井新司（東レ）・伊東健治（金沢工大）"],
            ["(7)", "5月19日(金)",  "10:50-11:15", "放熱用窒化アルミニウムアンテナを用いた5.8GHz帯10Wレクテナ   MW2023-15", "○坂井尚貴・古谷尚季・廣瀬裕也・内山海渡・小松郁弥・伊東健治（金沢工大）"],   
            ["(8)", "5月19日(金)",  "11:15-11:40", "2周波数帯での電磁界結合型マイクロ波加熱の研究   MW2023-16", "○勝田慎平・三谷友彦・篠原真毅（京大）"],
            ["(9)", "5月19日(金)",  "13:00-13:25", "管軸分岐端子をオフセット配置した小型OMT   MW2023-17", "○湯川秀憲・関　竜哉・深沢　徹・稲沢良夫（三菱電機）"],
            ["(10)", "5月19日(金)",  "13:25-13:50", "人工磁気導体を曲げた際の動作帯域幅への影響   MW2023-18", "山下周斗・○並川凌介・島崎仁司（京都工繊大）"],
            ["(11)", "5月19日(金)",  "13:50-14:15", "CRLHメタマテリアル線路における非相反性の電子制御   MW2023-19", "○安田秀史・上田哲也（京都工繊大）"],
            ["(12)", "5月19日(金)",  "14:15-14:40", "量子コンピュータとマイクロ波工学  ", "○塩見英久（阪大）"]]
            expect(nokogiri_data.get_program_table).to eq ans
        end

        it '資料番号が取得できること' do
            data = [
                "放熱性を考慮した導波管8合成器   MW2023-9",
                "A design method for miniaturized multiplexer based on a novel substrate integrated defect ground structure   MW2023-10",
                "［招待講演］isogeometric解析を用いたMaxwell方程式に対する種々の境界積分方程式の選点法による離散化   MW2023-11",
                "［招待講演］導波路シミュレーションのための積分方程式に基づくモーメント法   MW2023-12",
                "地中に埋めた920MHz帯ヘリカルアンテナの小型化   MW2023-13",
                "CNT-TFT GADを用いる920MHz帯レクテナ   MW2023-14",
                "放熱用窒化アルミニウムアンテナを用いた5.8GHz帯10Wレクテナ   MW2023-15",
                "2周波数帯での電磁界結合型マイクロ波加熱の研究   MW2023-16",
                "管軸分岐端子をオフセット配置した小型OMT   MW2023-17",
                "人工磁気導体を曲げた際の動作帯域幅への影響   MW2023-18",
                "CRLHメタマテリアル線路における非相反性の電子制御   MW2023-19",
                "量子コンピュータとマイクロ波工学",
                "あああああMWああああ MW2023-20 EST2022"
                #後ろに他の資料番号があるときにもできるように
            ]
            expect(data.map { |d| NokogiriData.get_document(d) }).to eq [
                "MW2023-9",
                "MW2023-10",
                "MW2023-11",
                "MW2023-12",
                "MW2023-13",
                "MW2023-14",
                "MW2023-15",
                "MW2023-16",
                "MW2023-17",
                "MW2023-18",
                "MW2023-19",
                nil,
                "MW2023-20"
            ]
        end

        it 'タイトルを取得できること' do
            data = [
                "放熱性を考慮した導波管8合成器   MW2023-9",
                "A design method for miniaturized multiplexer based on a novel substrate integrated defect ground structure   MW2023-10",
                "［招待講演］isogeometric解析を用いたMaxwell方程式に対する種々の境界積分方程式の選点法による離散化   MW2023-11",
                "［招待講演］導波路シミュレーションのための積分方程式に基づくモーメント法   MW2023-12",
                "地中に埋めた920MHz帯ヘリカルアンテナの小型化   MW2023-13",
                "CNT-TFT GADを用いる920MHz帯レクテナ   MW2023-14",
                "放熱用窒化アルミニウムアンテナを用いた5.8GHz帯10Wレクテナ   MW2023-15",
                "2周波数帯での電磁界結合型マイクロ波加熱の研究   MW2023-16",
                "管軸分岐端子をオフセット配置した小型OMT   MW2023-17",
                "人工磁気導体を曲げた際の動作帯域幅への影響   MW2023-18",
                "CRLHメタマテリアル線路における非相反性の電子制御   MW2023-19",
                "量子コンピュータとマイクロ波工学 ",
                # "あああああMWああああ MW2023-20 EST2022"
                #後ろに他の資料番号があるときにもできるように
            ]

            expect(data.map { |d| NokogiriData.get_title(d) }).to eq [
                "放熱性を考慮した導波管8合成器",
                "A design method for miniaturized multiplexer based on a novel substrate integrated defect ground structure",
                "［招待講演］isogeometric解析を用いたMaxwell方程式に対する種々の境界積分方程式の選点法による離散化",
                "［招待講演］導波路シミュレーションのための積分方程式に基づくモーメント法",
                "地中に埋めた920MHz帯ヘリカルアンテナの小型化",
                "CNT-TFT GADを用いる920MHz帯レクテナ",
                "放熱用窒化アルミニウムアンテナを用いた5.8GHz帯10Wレクテナ",
                "2周波数帯での電磁界結合型マイクロ波加熱の研究",
                "管軸分岐端子をオフセット配置した小型OMT",
                "人工磁気導体を曲げた際の動作帯域幅への影響",
                "CRLHメタマテリアル線路における非相反性の電子制御",
                "量子コンピュータとマイクロ波工学"
                ]
        end

        it '必要なデータのみ取り出せること' do
            noko = HP_html.new("program").nokogiri
            nokogiri_data = NokogiriData.new(noko)
            ans = [[1, "5月18日(木)", "14:45-15:10", "放熱性を考慮した導波管8合成器", "MW2023-9", "廣田明道", "三菱電機"],
            [2, "5月18日(木)", "15:10-15:35","A design method for miniaturized multiplexer based on a novel substrate integrated defect ground structure", "MW2023-10","Weiyu Zhou", "UEC"],
            [3, "5月18日(木)", "15:50-16:40", "［招待講演］isogeometric解析を用いたMaxwell方程式に対する種々の境界積分方程式の選点法による離散化", "MW2023-11", "新納和樹", "京大"],       
            [4, "5月18日(木)", "16:40-17:30", "［招待講演］導波路シミュレーションのための積分方程式に基づくモーメント法", "MW2023-12", "田中雅宏", "岐阜大"],
            [5, "5月19日(金)", "10:00-10:25", "地中に埋めた920MHz帯ヘリカルアンテナの小型化", "MW2023-13", "島崎仁司", "京都工繊大"],
            [6, "5月19日(金)",  "10:25-10:50", "CNT-TFT GADを用いる920MHz帯レクテナ", "MW2023-14", "平井　司", "金沢工大"],
            [7, "5月19日(金)",  "10:50-11:15", "放熱用窒化アルミニウムアンテナを用いた5.8GHz帯10Wレクテナ", "MW2023-15", "坂井尚貴", "金沢工大"],   
            [8, "5月19日(金)",  "11:15-11:40", "2周波数帯での電磁界結合型マイクロ波加熱の研究", "MW2023-16", "勝田慎平", "京大"],
            [9, "5月19日(金)",  "13:00-13:25", "管軸分岐端子をオフセット配置した小型OMT", "MW2023-17", "湯川秀憲", "三菱電機"],
            [10, "5月19日(金)",  "13:25-13:50", "人工磁気導体を曲げた際の動作帯域幅への影響", "MW2023-18", "並川凌介", "京都工繊大"],
            [11, "5月19日(金)",  "13:50-14:15", "CRLHメタマテリアル線路における非相反性の電子制御", "MW2023-19", "安田秀史", "京都工繊大"],
            [12, "5月19日(金)",  "14:15-14:40", "量子コンピュータとマイクロ波工学", nil, "塩見英久", "阪大"]]
            expect(nokogiri_data.get_need_data).to eq ans
        end

        # it '正しく取得できていること' do
        #     url = "https://ken.ieice.org/ken/program/index.php?tgs_regid=0ed2600ede7397c351868da5cd36749683c9c2c961acea2f3f5864bc13850e73&tgid=IEICE-MW"
        #     test_program_nokodata = NokogiriData.new(HP_html.new(url).nokogiri)

        #     ans = [["(16)MW", "7月19日(火)", "09:20-09:45", "遮断円筒導波管反射法による大径寸法の治具を用いた10 - 1000MHzでの液体の誘電率測定", "MW2022-41", "柴田幸司", "八戸工大"],
        #        ["(17)MW", "7月19日(火)", "09:45-10:10", "比帯域71%を達成する1GHz帯広帯域シングルシャント整流器の設計，測定，評価", "MW2022-42", "朝倉俊哉", "鹿児島大"],
        #        ["(18)MW", "7月19日(火)", "10:10-10:35", "ブロードサイドカプラで構成したバトラーマトリクスを用いた5.2GHz帯反射型レトロディレクティブアレー", "MW2022-43", "本間優作", "東北大"],
        #        ["(19)MW", "7月19日(火)", "10:50-11:15", "QSFP28 光モジュール出力の1次イメージ成分を用いた20GHz帯光ファイバー給電の1ビットBP-ΔΣダイレクトデジタルRF送信機", "MW2022-44", "張　俊皓", "東北大"],
        #        ["(20)MW", "7月19日(火)", "11:15-12:05", "［招待講演］サブテラヘルツ帯通信における空間領域信号処理", "MW2022-45", "小川恭孝", "北大"],
        #        ["(21)MW", "7月19日(火)", "13:00-13:25", "導波管マイクロストリップ変換器を付与したW帯SIW電力分配器の開発", "MW2022-46", "藤原康平", "都立産技研センター"]
        #     ]

        #     expect(test_program_nokodata.get_need_data).to eq ans
        # end



    end
end