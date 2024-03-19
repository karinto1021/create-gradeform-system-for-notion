function create_grade_googleform(){

    // const ss = SpreadsheetApp.getActiveSpreadsheet()
    // const sheet = ss.getSheetByName('2022')
    const sheet = getSheet()

    // 採点に必要な情報
    var numbers = []
    var dates = []
    var times = []
    var titles = []
    var affiliations = []
    var presenters = []

    program_data = getProgramData()
    month_id = createProgramIDHash(program_data)

    // sheetから発表データを取得
    datasFromsheet = getLastLine(sheet)
    eventDate = datasFromsheet.shift()

    formKey = month_id[eventDate]

    year = eventDate.split('-')[0]
    month = eventDate.split('-')[1]
    
    for (let data of datasFromsheet) {
        numbers.push(data.split(",")[0])
        dates.push(data.split(",")[1])
        times.push(data.split(",")[2])
        titles.push(data.split(",")[3])
        affiliations.push(data.split(",")[4])
        presenters.push(data.split(",")[5])
    }

    // 日付で選別
    numbers_form = []
    dates_form = []
    times_form = []
    titles_form = []
    affiliations_form = []
    presenters_form = []
    
    dates_all = []
    dates_all = unique(dates)

    numbers_hold = []
    dates_hold = []
    times_hold = []
    titles_hold = []
    affiliations_hold = []
    presenters_hold = []

    start = 0;

    for (let i = 0; i < dates_all.length; i++) {
        for (let j = start; j < dates.length; j++) {
            if (dates[j] == dates_all[i]) {
                numbers_hold.push(numbers[j])
                dates_hold.push(dates[j])
                times_hold.push(times[j])
                titles_hold.push(titles[j])
                affiliations_hold.push(affiliations[j])
                presenters_hold.push(presenters[j])
            }else{
                start = j;
                break;
            }
        }
        numbers_form.push(numbers_hold)
        dates_form.push(dates_hold)
        times_form.push(times_hold)
        titles_form.push(titles_hold)
        affiliations_form.push(affiliations_hold)
        presenters_form.push(presenters_hold)

        numbers_hold = []
        dates_hold = []
        times_hold = []
        titles_hold = []
        affiliations_hold = []
        presenters_hold = []
    }


    // 1日目と2日目を分ける
    // var diff_index = 0
    // for (let i = 0; i < dates.length; i++) {
    //     if(dates[i]!=dates[i+1]){
    //         diff_index = i
    //         break
    //     }
    // }

    // for (let i = 0; i <= diff_index; i++){
    //     numbers_one.push(numbers.shift())
    //     dates_one.push(dates.shift())
    //     times_one.push(times.shift())
    //     titles_one.push(titles.shift())
    //     affiliations_one.push(affiliations.shift())
    //     presenters_one.push(presenters.shift())
    // }

    // numbers_two = numbers
    // dates_two = dates
    // times_two = times
    // titles_two = titles
    // affiliations_two = affiliations
    // presenters_two = presenters

    // console.log(numbers_one)
    // console.log(dates_one)
    // console.log(times_one)
    // console.log(titles_one)
    // console.log(affiliations_one)
    // console.log(presenters_one)

    // console.log(numbers_two)
    // console.log(dates_two)
    // console.log(times_two)
    // console.log(titles_two)
    // console.log(affiliations_two)
    // console.log(presenters_two)

    //新規作成したgoogleformの保存を別ファイルにする
    // const id = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
    const id = scriptPropertyFor('FOLDER_ID')
    
    urls = []
    // console.log(numbers_form)
    // console.log(dates_form)
    // console.log(times_form)
    // console.log(titles_form)
    // console.log(affiliations_form)
    // console.log(presenters_form)

    for (let i = 0; i < dates_form.length; i++) {
        form_return = create_form_based(year, month, numbers_form[i], dates_form[i], times_form[i], titles_form[i], affiliations_form[i], presenters_form[i], formKey, i+1)
        urls.push(form_return.url)
        form = form_return.form

        // 作成したフォームを別フォルダに保存
        formFile = DriveApp.getFileById(form.getId());
        DriveApp.getFolderById(id).addFile(formFile);
        DriveApp.getRootFolder().removeFile(formFile);
    }


    // form_return = create_form_based(year, month, numbers_one, dates_one, times_one, titles_one, affiliations_one, presenters_one, formKey)
    // form = form_return.form
    // url = form_return.url
    // url_two = null
    
    // DriveApp.getFolderById(id).addFile(formFile);
    // DriveApp.getRootFolder().removeFile(formFile);
    
    // // Logger.log('Published URL: ' + form.getPublishedUrl());
    
    // // 2日目の発表がある場合formを生成
    // if(dates_two.length != 0){
    //     form_two_return = create_form_based(year, month, numbers_two, dates_two, times_two, titles_two, affiliations_two, presenters_two, formKey, 2)
    //     form_two = form_two_return.form
    //     url_two = form_two_return.url

    //     const formFile_two = DriveApp.getFileById(form_two.getId());
    //     DriveApp.getFolderById(id).addFile(formFile_two);
    //     DriveApp.getRootFolder().removeFile(formFile_two);
    // }

    // 作成したフォームのURL
    return urls
}

// 作成したフォームのURL
// https://docs.google.com/forms/d/1zD_-C-ePqVGIRcH4WLwUIjcd2vfFeTgF6ka7YykxQZk/edit

