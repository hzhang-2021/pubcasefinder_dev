from flask import Blueprint
from flask import render_template
from flask import jsonify
from flask import request
from casesharing.api import tool_matching, tool_submission, tool_user


new_bp = Blueprint('new_bp', __name__, template_folder='templates')


@new_bp.route('/casesharing/users/', methods=['POST'])
def user_post():
    google_id = request.form['google_id']
    first_name_en = request.form['first_name_en']
    last_name_en = request.form['last_name_en']
    affiliation_en = request.form['affiliation_en']
    job_title_en = request.form['job_title_en']
    group_en = request.form['group_en']
    user_type = request.form['user_type']
    email = request.form['email']
    first_name_nl = request.form['first_name_nl']
    last_name_nl = request.form['last_name_nl']
    affiliation_nl = request.form['affiliation_nl']
    job_title_nl = request.form['job_title_nl']
    group_nl = request.form['group_nl']

    response = tool_user.post(
            google_id=google_id,
            first_name_en=first_name_en,
            last_name_en=last_name_en,
            affiliation_en=affiliation_en,
            job_title_en=job_title_en,
            group_en=group_en,
            user_type=user_type,
            email=email,
            first_name_nl=first_name_nl,
            last_name_nl=last_name_nl,
            affiliation_nl=affiliation_nl,
            job_title_nl=job_title_nl,
            group_nl=group_nl
        )
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/users/<user_id>', methods=['GET'])
def users_get(user_id):
    response = tool_user.get(user_id=user_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/users/<user_id>', methods=['PUT'])
def user_put(user_id):
    # user_id = request.args.get('user_id')
    column_name = request.form['column_name']
    new_value = request.form['new_value']
    response = tool_user.put(
        user_id=user_id,
        column_name=column_name,
        new_value=new_value
    )
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/users/<user_id>', methods=['DELETE'])
def users_delete(user_id):
    response = tool_user.delete(user_id=user_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/submissions/', methods=['POST'])
def submission_post():
    name = request.form['name']
    # user_id = request.form['user_id']
    submitter_email = request.form['submitter_email']
    submitter_first_name = request.form['submitter_first_name']
    submitter_last_name = request.form['submitter_last_name']
    submitter_institution = request.form['submitter_institution']
    suspected_diseases = request.form['suspected_diseases']
    clinical_diagnoses = request.form['clinical_diagnoses']
    final_diagnoses = request.form['final_diagnoses']
    phenotypes = request.form['phenotypes']
    gene_symbols = request.form['gene_symbols']
    ensembl_ids = request.form['ensembl_ids']
    entrez_ids = request.form['entrez_ids']
    allelic_states = request.form.get('allelic_states', '')
    inheritances = request.form.get('inheritances', '')
    matching_rule_medical_info = request.form['matching_rule_medical_info']
    matching_rule_phenotype_info = request.form['matching_rule_phenotype_info']
    matching_rule_genotype_info = request.form['matching_rule_genotype_info']
    restrict_matches_to_researchers = request.form.get('restrict_matches_to_researchers') == "true"
    restrict_matches_to_providers = request.form.get('restrict_matches_to_providers') == "true"
    comment = request.form['comment']

    response = tool_submission.post(
        name=name,
        # user_id=user_id,
        submitter_email=submitter_email,
        submitter_first_name=submitter_first_name,
        submitter_last_name=submitter_last_name,
        submitter_institution=submitter_institution,
        suspected_diseases=suspected_diseases,
        clinical_diagnoses=clinical_diagnoses,
        final_diagnoses=final_diagnoses,
        phenotypes=phenotypes,
        gene_symbols=gene_symbols,
        ensembl_ids=ensembl_ids,
        entrez_ids=entrez_ids,
        allelic_states=allelic_states,
        inheritances=inheritances,
        matching_rule_medical_info=matching_rule_medical_info,
        matching_rule_phenotype_info=matching_rule_phenotype_info,
        matching_rule_genotype_info=matching_rule_genotype_info,
        restrict_matches_to_researchers=restrict_matches_to_researchers,
        restrict_matches_to_providers=restrict_matches_to_providers,
        comment=comment
    )
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/submissions/<submission_id>', methods=['GET'])
def submissions_get(submission_id):
    response = tool_submission.get(submission_id=submission_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/submissions/<submission_id>', methods=['PUT'])
def submission_put(submission_id):
    # 複数フィールドを一度に更新
    updates = dict(request.form)
    response = tool_submission.put_multiple(
        submission_id=submission_id,
        updates=updates
    )
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/submissions/<submission_id>', methods=['DELETE'])
def submissions_delete(submission_id):
    response = tool_submission.delete(submission_id=submission_id)
    return jsonify(response['body']), response['response_code']


# @new_bp.route('/casesharing/matchings/', methods=['POST'])
# def matchings_post():
#     source_submission_id = request.form['source_submission_id']
#     target_submission_id = request.form['target_submission_id']

#     response = tool_matching.post(
#         source_submission_id=source_submission_id,
#         target_submission_id=target_submission_id
#     )
#     return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/matchings/<matching_id>', methods=['GET'])
def matchings_get(matching_id):
    response = tool_matching.get(matching_id=matching_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/matchings-filtered-by-submission/<submission_id>', methods=['GET'])
def matchings_get_filtered_by_submission(submission_id):
    response = tool_matching.get_all_with_submission_id(submission_id=submission_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/count-matchings/<submission_id>', methods=['GET'])
def count_matchings(submission_id):
    response = tool_matching.get_matching_count_with_submission_id(submission_id=submission_id)
    return jsonify(response['body']), response['response_code']


@new_bp.route('/casesharing/matchings/<matching_id>', methods=['PUT'])
def matching_put(matching_id):
    column_name = request.form['column_name']
    new_value = request.form['new_value']
    response = tool_matching.put(
        matching_id=matching_id,
        column_name=column_name,
        new_value=new_value
    )
    return jsonify(response['body']), response['response_code']


# @new_bp.route('/casesharing/matchings/<matching_id>', methods=['DELETE'])
# def matchings_delete(matching_id):
#     return tool_matching.delete(matching_id=matching_id)


@new_bp.route('/casesharing/debug-session', methods=['GET'])
def debug_session():
    return jsonify({
        'has_user_info_pcf': 'user-info-pcf' in session,
        'session_keys': list(session.keys()),
    })


@new_bp.route('/casesharing/users_test/')
def casesharing_users_test():
    return render_template('user_post.html')


@new_bp.route('/casesharing/submissions_test/')
def casesharing_submissions_test():
    return render_template('submission_post.html')
