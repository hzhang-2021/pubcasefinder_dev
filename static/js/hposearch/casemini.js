
const ID_ACTION_BTN_WRAPPER = 'casemini_action_btn_wrapper';

const ID_UPDATE_DATE_LABEL  = 'update-date-label';

const TARGET_HPO="hpo",TARGET_ICD10="icd_10",TARGET_OMOR="omim_orpha",TARGET_NANBYO = "nanbyo",
      TARGET_LIST = [TARGET_HPO,TARGET_ICD10,TARGET_OMOR,TARGET_NANBYO];

const TARGET_DEF_HASH = {
     [TARGET_HPO] : {
      'panel_id':              "casemini-hpo-panel",
      'id_action_btn_wrapper': ID_ACTION_BTN_WRAPPER,
      'data_version':          'HPO バージョン：2024-04-26',
      'data_update_date':      'データ更新日：2024/07/12'
     },
     [TARGET_ICD10] : {
      'panel_id':              "casemini-icd_10-panel",
      'id_action_btn_wrapper': ID_ACTION_BTN_WRAPPER,
      'data_version':          '標準病名マスター バージョン：5.0',
      'data_update_date':      'データ更新日：2024/07/12'
     },
     [TARGET_OMOR] : {
      'panel_id':              "casemini-omim_orpha-panel",
      'id_action_btn_wrapper': ID_ACTION_BTN_WRAPPER,
      'data_version':          'Mondo バージョン：2024-07-02',
      'data_update_date':      'データ更新日：2024/07/12'
     },
     [TARGET_NANBYO] : {
      'panel_id':              "casemini-nanbyo-panel",
      'id_action_btn_wrapper': ID_ACTION_BTN_WRAPPER,
      'data_version':          'NANDO バージョン：2023-11-27',
      'data_update_date':      'データ更新日：2024/07/12'
     }
};

function _init_casesharing_mini(target_init){
    //init ui
    TARGET_LIST.forEach(function(target){
        let obj = TARGET_DEF_HASH[target];
        $("#"+obj.panel_id).casemini_panel({
            'language':              'ja',
            'target':                target,
            'id_action_btn_wrapper': obj.id_action_btn_wrapper,
            'data_version':          obj.data_version,
            'data_update_date':      obj.data_update_date
        });
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (event) {
        let btn_id = event.target.id; // newly activated tab
        let panel_id= $("#"+btn_id).attr('href');
 
        let casemini_target = $(panel_id).data('casemini-target');
        $('#'+ID_ACTION_BTN_WRAPPER).removeClass(TARGET_HPO)
                                    .removeClass(TARGET_ICD10)
                                    .removeClass(TARGET_OMOR)
                                    .removeClass(TARGET_NANBYO)
                                    .addClass(casemini_target);
        $(panel_id).casemini_panel('setInputBoxFocus');
        $('#'+ID_UPDATE_DATE_LABEL).text(TARGET_DEF_HASH[casemini_target].data_update_date);
    });

    let id_target_panel = "casemini-"+target_init+"-panel";
    $('#'+id_target_panel).casemini_panel('setInputBoxFocus');
    $('#'+ID_ACTION_BTN_WRAPPER).addClass(target_init);
    $('#'+ID_UPDATE_DATE_LABEL).text(TARGET_DEF_HASH[target_init].data_update_date);
}
