function modify_grade_googleform(){
    
    // スプレッドシートからデータを取得

    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = ss.getSheetByName('2022')

    // 採点に必要な情報
    var numbers = []
    var dates = []
    var times = []
    var titles = []
    var affiliations = []
    var presenters = []

    // 行全体を取得できるようにする
    // var lastRow = sheet.getLastRow()//最後の行
    // var lastColumn = sheet.getLastColumn()//最後の列
    // var datasFromsheet = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0]

    program_data = getProgramData()
    month_id = createProgramIDHash(program_data)

    // sheetから発表データを取得
    // datasFromsheet = getPresentationDataFromSheet(sheet)
    datasFromsheet = getLastLine(sheet)
    month = datasFromsheet.shift()

    formKey = month_id[month]

    year = eventDate.split('-')[0]
    month = eventDate.split('-')[1]

    // 取得したデータをそれぞれ,で分割
    // datasFromsheet.forEach(function(data){
    //     numbers.push(data.split(",")[0])
    //     dates.push(data.split(",")[1])
    //     times.push(data.split(",")[2])
    //     titles.push(data.split(",")[3])
    //     affiliations.push(data.split(",")[4])
    //     presenters.push(data.split(",")[5])
    // })
    
    for (let data of datasFromsheet) {
        numbers.push(data.split(",")[0])
        dates.push(data.split(",")[1])
        times.push(data.split(",")[2])
        titles.push(data.split(",")[3])
        affiliations.push(data.split(",")[4])
        presenters.push(data.split(",")[5])
    }
    
    // formを作成
    
    var formid = '1zD_-C-ePqVGIRcH4WLwUIjcd2vfFeTgF6ka7YykxQZk'//編集のform id
    const form = FormApp.openById(formid)
    
    var formTitle = 'マイクロ波研究会学生研究発表賞 採点表' + year + '年度' + month + '月';
    const formDescription = '別紙の採点ガイドラインに従い、\nA. 発表内容の新規性、\nB. 発表内容の信頼性、\nC. 発表内容の完成度、\nD. パワーポイントのまとまり、\nE. プレゼンテーションの質と時間、\nF. 質疑応答に対する態度、\nの各項目につき１０点満点（５点を基準として）で評価をお願い致します。\n\n同一組織、共著などの関連論文は採点されないようお願いいたします。\n\n確認事項：講演者は筆頭著者本人でない場合は下記項目に点をつけずに、合計点は　0　としてください。\n(すべての点数に0を入力してください)\n\n採点終了後、採点表を宮田宛（miyata@metro-cit.ac.jp）にご送付ください。'
    
    form.getItems().forEach(function(item){
        // Logger.log(item.getTitle())
        form.deleteItem(item)
    })
    
    // form.collectsEmail()

    //最初のタイトルを設定
    form.setTitle(formTitle)
    form.setDescription(formDescription)
    
    // 回答がどのprogramかわかるようにprogramIDを記述しておく
    // form.addTextItem().setTitle('システムで使用するので編集しないでください。').setRequired(true)
    
    form.addSectionHeaderItem().setTitle('まず採点者の氏名，所属，メールアドレスをご入力ください。')
    form.addTextItem().setTitle('氏名').setRequired(true)
    form.addTextItem().setTitle('所属').setRequired(true)
    form.addTextItem().setTitle('メールアドレス').setRequired(true).setValidation(FormApp.createTextValidation().requireTextIsEmail().build())
    
    // // セクションを追加
    // var first = form.addPageBreakItem().setTitle(numbers[0])
    // const TimeDescription = '時間\n' + dates[0] + ' ' + times[0] + '\n\n'
    // const TitleDescription = 'タイトル\n' + titles[0] + '\n\n'
    // const AffiliationDescription = '所属\n' + affiliations[0] + '\n\n'
    // const PresenterDescription = '発表者\n' + presenters[0] + '\n\n'
    // const sectionDescription = TimeDescription + TitleDescription + AffiliationDescription + PresenterDescription
    
    // first.setHelpText(sectionDescription)
    
    // // 質問を追加(ok)
    // form.addScaleItem().setTitle('内容の新規性(A)(10点)').setBounds(0, 10).setRequired(true)
    // form.addScaleItem().setTitle('内容の信憑性(B)(10点)').setBounds(0, 10).setRequired(true)
    // form.addScaleItem().setTitle('内容の完成度(C)(10点)').setBounds(0, 10).setRequired(true)
    // form.addScaleItem().setTitle('スライドの出来(D)(10点)').setBounds(0, 10).setRequired(true)
    // form.addScaleItem().setTitle('プレゼンの質と時間(E)(10点)').setBounds(0, 10).setRequired(true)
    // form.addScaleItem().setTitle('質疑応答(F)(10点)').setBounds(0, 10).setRequired(true)
    // form.addTextItem().setTitle('コメント\n講評のときに使用しますので特にいい部分につき記入をお願いします').setRequired(false)

    // 回答用オブジェクト
    var formResponse = form.createResponse()
    var endQuestions = []
    
    // 全てのセクションを追加
    for(var i=0; i < numbers.length; i++){
        var section = form.addPageBreakItem().setTitle(numbers[i])
        const TimeDescription = '時間 : ' + dates[i] + ' ' + times[i] + '\n\n'
        const TitleDescription = 'タイトル : ' + titles[i] + '\n\n'
        const AffiliationDescription = '所属 : ' + affiliations[i] + '\n\n'
        const PresenterDescription = '発表者 : ' + presenters[i]
        const sectionDescription = TimeDescription + TitleDescription + AffiliationDescription + PresenterDescription
        section.setHelpText(sectionDescription)
        
        formResponse.withItemResponse(form.addScaleItem().setTitle('内容の新規性(A)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        formResponse.withItemResponse(form.addScaleItem().setTitle('内容の信頼性(B)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        formResponse.withItemResponse(form.addScaleItem().setTitle('内容の完成度(C)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        formResponse.withItemResponse(form.addScaleItem().setTitle('スライドの出来(D)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        formResponse.withItemResponse(form.addScaleItem().setTitle('プレゼンの質と時間(E)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        formResponse.withItemResponse(form.addScaleItem().setTitle('質疑応答(F)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        form.addTextItem().setTitle('コメント\n講評のときに使用しますので特にいい部分につき記入をお願いします').setRequired(false)

        // 全てのセクションの最後に採点を終了するかの質問
        // endQuestions.push(form.addMultipleChoiceItem().setTitle('本日分の採点を終了しますか？').setRequired(true))
    }

    form.addPageBreakItem().setTitle('ご回答ありがとうございました。\n以下はシステムで使用するので編集せずこのままご送信ください。')
    formResponse.withItemResponse(form.addTextItem().setTitle('システムで使用するので編集しないでください。').setRequired(true).createResponse(formKey))

    // 採点を終了するかの質問を追加した時、'はい'で最後のページに飛べるようにする
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // var last = form.addPageBreakItem().setTitle('ご回答ありがとうございました。')

    // for(let question of endQuestions){
    //     question.setChoices([
    //         question.createChoice('はい', last),
    //         question.createChoice('いいえ', FormApp.PageNavigationType.CONTINUE)
    //     ])
    //     formResponse.withItemResponse(question.createResponse('いいえ'))
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // scaleItemにデフォルト値を設定する
    // var formResponse = form.createResponse()
    // for (let item of form.getItems(FormApp.ItemType.SCALE)) {
    //     formResponse.withItemResponse(item.asScaleItem().createResponse(0))
    // }
    
    
    
    
    console.log(formResponse.toPrefilledUrl())
    // Logger.log('Published URL: ' + form.getPublishedUrl());
    
}


// 作成したフォームのURL
// https://docs.google.com/forms/d/1zD_-C-ePqVGIRcH4WLwUIjcd2vfFeTgF6ka7YykxQZk/edit
