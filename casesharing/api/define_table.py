from typing import Literal
from pydantic import BaseModel, ValidationError
from sqlalchemy import ForeignKey
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.types import String
from sqlalchemy.types import TIMESTAMP as Timestamp
from sqlalchemy.types import Date
from .settings import engine
from .util import separate_with_comma
from .util import has_intersection

MatchingRule = Literal["required", "optional", "ignored"]


# Pydanticモデルの定義
class MatchingRuleModel(BaseModel):
    rule: MatchingRule


# 変換関数の定義
def to_matching_rule(value: str) -> MatchingRule:
    try:
        model = MatchingRuleModel(rule=value)
        return model.rule
    except ValidationError as e:
        print(f"Validation Error: {e}")
        raise ValueError(f"Invalid value for MatchingRule: {value}")


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user_account"

    # ユーザーID
    id: Mapped[int] = mapped_column(
        primary_key=True,
        nullable=False,
        autoincrement=True
    )
    google_id: Mapped[str] = mapped_column(
        # Gmailアドレスは最大40文字（ユーザー名30文字 + "@gmail.com"10文字）
        # 参考：https://support.google.com/mail/answer/9211434?hl=ja
        # 10文字のバッファをもたせる
        String(50),
        nullable=False,
        unique=True
    )
    first_name_en: Mapped[str] = mapped_column(
        # Slackの名前の最大文字数は80文字
        String(40),
        nullable=False
    )
    last_name_en: Mapped[str] = mapped_column(
        # Slackの名前の最大文字数は80文字
        String(40),
        nullable=False
    )
    affiliation_en: Mapped[str] = mapped_column(
        # TODO: 適切な文字数を考える
        String(256),
        nullable=False
    )
    job_title_en: Mapped[str] = mapped_column(
        # TODO: 適切な文字数を考える
        String(256),
        nullable=False
    )
    group_en: Mapped[str] = mapped_column(
        String(256),
        nullable=True
    )
    first_name_nl: Mapped[str] = mapped_column(
        # Slackの名前の最大文字数は80文字
        String(40),
        nullable=True
    )
    last_name_nl: Mapped[str] = mapped_column(
        # Slackの名前の最大文字数は80文字
        String(40),
        nullable=True
    )
    affiliation_nl: Mapped[str] = mapped_column(
        # TODO: 適切な文字数を考える
        String(256),
        nullable=True
    )
    job_title_nl: Mapped[str] = mapped_column(
        # TODO: 適切な文字数を考える
        String(256),
        nullable=True
    )
    group_nl: Mapped[str] = mapped_column(
        String(256),
        nullable=True
    )
    user_type: Mapped[int] = mapped_column(
        nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    created_at: Mapped[str] = mapped_column(
        Timestamp(),
        nullable=False
    )
    uid: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    authentication_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    status: Mapped[int] = mapped_column(
        nullable=False
    )
    changed_at: Mapped[str] = mapped_column(
        Timestamp(),
        nullable=True
    )
    is_updated: Mapped[int] = mapped_column(
        nullable=False
    )

    def __repr__(self) -> str:
        text_to_print = """
        User----------------------------------------------
                         id: {}
                  google_id: {}
              first_name_en: {}
               last_name_en: {}
             affiliation_en: {}
               job_title_en: {}
                   group_en: {}
              first_name_nl: {}
               last_name_nl: {}
             affiliation_nl: {}
               job_title_nl: {}
                   group_nl: {}
                  user_type: {}
                      email: {}
                 created_at: {}
                        uid: {}
        authentication_code: {}
                     status: {}
                 changed_at: {}
                 is_updated: {}
        ---------------------------------------------------
        """
        return text_to_print.format(
            self.id,
            self.google_id,
            self.first_name_en,
            self.last_name_en,
            self.affiliation_en,
            self.job_title_en,
            self.group_en,
            self.first_name_nl,
            self.last_name_nl,
            self.affiliation_nl,
            self.job_title_nl,
            self.group_nl,
            self.user_type,
            self.email,
            self.created_at,
            self.uid,
            self.authentication_code,
            self.status,
            self.changed_at,
            self.is_updated
        )

    def as_dict(self):
        ret_dict = {
            'id': self.id,
            'google_id': self.google_id,
            'first_name_en': self.first_name_en,
            'last_name_en': self.last_name_en,
            'affiliation_en': self.affiliation_en,
            'job_title_en': self.job_title_en,
            'group_en': self.group_en,
            'first_name_nl': self.first_name_nl,
            'last_name_nl': self.last_name_nl,
            'affiliation_nl': self.affiliation_nl,
            'job_title_nl': self.job_title_nl,
            'group_nl': self.group_nl,
            'user_type': self.user_type,
            'email': self.email,
            'created_at': self.created_at,
            'uid': self.uid,
            'authentication_code': self.authentication_code,
            'status': self.status,
            'changed_at': self.changed_at,
            'is_updated': self.is_updated
        }
        return ret_dict


class Submission(Base):
    __tablename__ = "submission"
    id: Mapped[int] = mapped_column(
        nullable=False,
        primary_key=True,
        autoincrement=True
    )
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_account.id")
    )
    submitter_email: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    submitter_first_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    submitter_last_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    submitter_institution: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    suspected_diseases: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    clinical_diagnoses: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    final_diagnoses: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    phenotypes: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    gene_symbols: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    ensembl_ids: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    entrez_ids: Mapped[str] = mapped_column(
        String(256),
        nullable=False
    )
    allelic_states: Mapped[str] = mapped_column(
        String(256),
        nullable=True,
        default=''
    )
    inheritances: Mapped[str] = mapped_column(
        String(256),
        nullable=True,
        default=''
    )
    matching_rule_medical_info: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=False
    )
    matching_rule_phenotype_info: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=True,
        default='ignored'
    )
    matching_rule_genotype_info: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=False
    )
    restrict_matches_to_researchers: Mapped[bool] = mapped_column(
        nullable=False
    )
    restrict_matches_to_providers: Mapped[bool] = mapped_column(
        nullable=False
    )
    comment: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )
    user: Mapped["User"] = relationship(
        # back_populates="submissions",
        foreign_keys=[user_id]
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active"
    )

    def __repr__(self) -> str:
        text_to_print = """
        Submission-----------------------------------------
                                     id: {}
                                   name: {}
                                user_id: {}
                        submitter_email: {}
                   submitter_first_name: {}
                    submitter_last_name: {}
                  submitter_institution: {}
                     suspected_diseases: {}
                     clinical_diagnoses: {}
                        final_diagnoses: {}
                             phenotypes: {}
                           gene_symbols: {}
                            ensembl_ids: {}
                             entrez_ids: {}
             matching_rule_medical_info: {}
            matching_rule_genotype_info: {}
        restrict_matches_to_researchers: {}
          restrict_matches_to_providers: {}
                                comment: {}
                                 status: {}
        ---------------------------------------------------
        """
        return text_to_print.format(
            self.id,
            self.name,
            self.user_id,
            self.submitter_email,
            self.submitter_first_name,
            self.submitter_last_name,
            self.submitter_institution,
            self.suspected_diseases,
            self.clinical_diagnoses,
            self.final_diagnoses,
            self.phenotypes,
            self.gene_symbols,
            self.ensembl_ids,
            self.entrez_ids,
            self.matching_rule_medical_info,
            self.matching_rule_genotype_info,
            self.restrict_matches_to_researchers,
            self.restrict_matches_to_providers,
            self.comment,
            self.status
        )

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "submitter_email": self.submitter_email,
            "submitter_first_name": self.submitter_first_name,
            "submitter_last_name": self.submitter_last_name,
            "submitter_institution": self.submitter_institution,
            "suspected_diseases": self.suspected_diseases,
            "clinical_diagnoses": self.clinical_diagnoses,
            "final_diagnoses": self.final_diagnoses,
            "phenotypes": self.phenotypes,
            "gene_symbols": self.gene_symbols,
            "ensembl_ids": self.ensembl_ids,
            "entrez_ids": self.entrez_ids,
            "allelic_states": self.allelic_states or '',
            "inheritances": self.inheritances or '',
            "matching_rule_medical_info": self.matching_rule_medical_info,
            "matching_rule_phenotype_info": self.matching_rule_phenotype_info or 'ignored',
            "matching_rule_genotype_info": self.matching_rule_genotype_info,
            "restrict_matches_to_researchers": self.restrict_matches_to_researchers,
            "restrict_matches_to_providers": self.restrict_matches_to_providers,
            "comment": self.comment,
            "status": self.status
        }

    def is_phenotype_info_matched(self, other) -> bool:
        return has_intersection(
            separate_with_comma(self.phenotypes),
            separate_with_comma(other.phenotypes)
        )

    def is_medical_info_matched(self, other) -> bool:
        self_medical_info = separate_with_comma(self.suspected_diseases).union(
            separate_with_comma(self.clinical_diagnoses),
            separate_with_comma(self.final_diagnoses)
        )
        other_medical_info = separate_with_comma(other.suspected_diseases).union(
            separate_with_comma(other.clinical_diagnoses),
            separate_with_comma(other.final_diagnoses)
        )
        return has_intersection(self_medical_info, other_medical_info)

    def is_genotype_info_matched(self, other) -> bool:
        if has_intersection(
            separate_with_comma(self.gene_symbols),
            separate_with_comma(other.gene_symbols)
        ):
            return True
        if has_intersection(
            separate_with_comma(self.ensembl_ids),
            separate_with_comma(other.ensembl_ids)
        ):
            return True
        if has_intersection(
            separate_with_comma(self.entrez_ids),
            separate_with_comma(other.entrez_ids)
        ):
            return True
        return False


class Matching(Base):
    __tablename__ = "matching"
    id: Mapped[int] = mapped_column(
        nullable=False,
        primary_key=True,
        autoincrement=True
    )
    source_submission_id: Mapped[int] = mapped_column(
        ForeignKey("submission.id"),
        nullable=False
    )
    target_submission_id: Mapped[int] = mapped_column(
        ForeignKey("submission.id"),
        nullable=False
    )
    medical_rule: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=False
    )
    phenotype_rule: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=True,
        default='ignored'
    )
    genotype_rule: Mapped[MatchingRule] = mapped_column(
        String(10),
        nullable=False
    )
    medical_match: Mapped[bool] = mapped_column(
        nullable=False
    )
    phenotype_match: Mapped[bool] = mapped_column(
        nullable=True,
        default=False
    )
    genotype_match: Mapped[bool] = mapped_column(
        nullable=False
    )
    score: Mapped[int] = mapped_column(
        nullable=False
    )
    date: Mapped[str] = mapped_column(
        Date(),
        nullable=False
    )
    is_read: Mapped[int] = mapped_column(
        nullable=False,
        default=0
    )
    # submissions: Mapped[tuple["Submission", "Submission"]] = relationship(
    #     foreign_keys=[submission_id1, submission_id2]
    # )
    source_submission: Mapped["Submission"] = relationship(
        # back_populates="matchings_source",
        foreign_keys=source_submission_id
    )
    target_submission: Mapped["Submission"] = relationship(
        # back_populates="matchings_target",
        foreign_keys=target_submission_id
    )

    def __repr__(self) -> str:
        text_to_print = """
        Matching---------------------------------------
                       id: {}
        source_submission: {}
        target_submission: {}
                     date: {}
        -----------------------------------------------
        """
        return text_to_print.format(
            self.id,
            self.source_submission_id,
            self.target_submission_id,
            self.date
        )

    def as_dict(self):
        return {
            "id": self.id,
            "source_submission_id": self.source_submission_id,
            "target_submission_id": self.target_submission_id,
            "medical_rule": self.medical_rule,
            "phenotype_rule": self.phenotype_rule or 'ignored',
            "genotype_rule": self.genotype_rule,
            "medical_match": self.medical_match,
            "phenotype_match": self.phenotype_match or False,
            "genotype_match": self.genotype_match,
            "date": self.date,
            "is_read": self.is_read
        }


if __name__ == '__main__':
    Base.metadata.create_all(engine)
    print("Database tables created.")
