#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

# ver 20240620:
#      modified fot change HPO-japanese.alpha.18Oct2017.tsv to HPO-japanese.20221104.txt



=pod

cat /opt/services/case/htdocs/data/hp_convert_robot.obo | \
sed \
-e 's/orcid\.org\//ORCID:/g' \
-e '/^property_value/d' \
-e '/^owl\-axioms/d' \
-e 's/^\(synonym:.*HP\):/\1_/g' \
-e '/^logical\-definition\-view\-relation/d' \
-e 's/^\(synonymtypedef: HP\):/\1_/g' \
-e 's/^\(synonym: .* EXACT \[\).*\(\]\)$/\1\2/g' \
-e 's/^\(def: .*\[\).*\(\]\)$/\1\2/g' \
-e 's/^\(xref: NCIT\)_/\1:/g' \
> /opt/services/case/htdocs/data/hp_convert_robot_edited.obo

/opt/services/case/htdocs/data/update_OntoTermHPInformation_tbl.pl \
pubcases \
/opt/services/case/mysql/mysql.sock \
/etc/my.cnf \
pubcase \
pubcase0712 \
/opt/services/case/htdocs/data/hp_convert_robot_edited.obo \
/opt/services/case/data/PubCases/ontologies/HP/HPO-japanese.alpha.18Oct2017.tsv \
1>/opt/services/case/htdocs/data/term_info.json


/opt/services/case/data/PubCases/update_OntoTermHPInformation_tbl.pl \
pubcases \
/opt/services/case/local/mysql-5.7.13/mysql.sock \
/opt/services/case/local/mysql-5.7.13/my.cnf \
pubcase \
pubcase0712 \
/opt/services/case/data/PubCases/ontologies/HP/hp_20170630_edited.obo \
/opt/services/case/data/PubCases/ontologies/HP/HPO-japanese.alpha.18Oct2017.tsv \
1>/dev/null

/opt/services/case/data/PubCases/update_OntoTermHPInformation_tbl.pl \
pubcases \
/opt/services/case/local/mysql-5.7.13/mysql.sock \
/opt/services/case/local/mysql-5.7.13/my.cnf \
pubcase \
pubcase0712 \
/opt/services/case/data/PubCases/ontologies/HP/hp_20181009_edited.obo \
/opt/services/case/data/PubCases/ontologies/HP/HPO-japanese.alpha.18Oct2017.tsv \
1>/dev/null

=cut

=pod
my $DBD = "mysql";
my $database;
my $file_sock;
my $file_cnf;
my $db_user;
my $db_passwd;
my $infile_onto_obo;
my $infile_onto_hp_japanese;
=cut

package DB;

use DBI;
use DBD::mysql;

use constant {
	DBD=>'mysql',
	DBSOCK=>"/opt/services/case/mysql/mysql.sock",
	DBCNF=>"/etc/my.cnf",
	DBHOST=>"localhost",
	DBNAME=>"pubcases",
	DBUSER=>"pubcase",
	DBPW=>"pubcase0712"
};

my $dbh;

sub connect {
	my $args = {
		DBD => &DBD(),
		database  => &DBNAME(),
		host      => &DBHOST(),
		file_sock => &DBSOCK(),
		file_cnf  => &DBCNF(),
		user      => &DBUSER(),
		passwd    => &DBPW(),
		@_
	};
	my $dsn = sprintf("DBI:%s:database=%s;host=%s;mysql_socket=%s;mysql_read_default_file=%s",$args->{'DBD'},$args->{'database'},$args->{'host'},$args->{'file_sock'},$args->{'file_cnf'});
#	say STDERR $dsn;
	$dbh = DBI->connect($dsn, $args->{'user'}, $args->{'passwd'});
	$dbh->{'mysql_enable_utf8'} = 1;
	$dbh->do("SET NAMES utf8");
	return $dbh;
}

sub disconnect {
	$dbh->disconnect();
	undef $dbh;
}

sub dbh {
	return $dbh;
}

package OBOParser;
use OBO::Parser::OBOParser;

#my $max_definition_length = 0;
#my $max_definition_string = '';

sub term_info {
	my $term = shift;
	my $term_info = {
		id => undef,
		name => undef,
#		synonym => undef,
#		definition => undef,
#		comment => undef
	};
	my $id = $term->id();
	my $name = $term->name();
	my $comment = $term->comment();
	my $definition = $term->def()->text();

	$term_info->{'id'}         = $id if(defined $id);
	$term_info->{'name'}       = $name if(defined $name);
	$term_info->{'definition'} = $definition if(defined $definition);
	$term_info->{'comment'}    = $comment if(defined $comment);

#	if(defined $definition && $max_definition_length < length $definition){
#		$max_definition_length = length $definition;
#		$max_definition_string = $definition;
#	}

	my @sorted_syns = map { $_->[0] }                 # restore original values
				sort { $a->[1] cmp $b->[1] }          # sort
				map  { [$_, lc($_->def()->text())] }  # transform: value, sortkey
				$term->synonym_set();
	if(scalar @sorted_syns){
		$term_info->{'synonym'} = [];
		my $synonym_hash = {};
		foreach my $synonym (@sorted_syns) {
			my $text = $synonym->def()->text();
			$synonym_hash->{$text} = undef if(defined $text && defined $name && $text ne $name);
		}
		my $synonym_arr = [sort keys(%$synonym_hash)];
		push(@{$term_info->{'synonym'}},@$synonym_arr) if(scalar @$synonym_arr);
		undef $synonym_arr;
		undef $synonym_hash;
	}
	undef @sorted_syns;


	my $intersection_of = [$term->intersection_of()];
	if(defined $intersection_of && ref $intersection_of eq 'ARRAY' && scalar @$intersection_of){
		$term_info->{'intersection_of'} = [];
		foreach my $item (@$intersection_of){
			my $intersection_of_info = {
#				id => undef,
#				name => undef,
#				type => undef,
#				head => undef,
#				tail => undef,
			};
			my $int_id = $item->id();
			my $int_type = $item->type();
#			my $tail = $item->tail();
			my $head = $item->head();

			$intersection_of_info->{'id'}   = $int_id if(defined $int_id);
			$intersection_of_info->{'type'} = $int_type if(defined $int_type);
#			$intersection_of_info->{'head'} = &term_simple_info($head) if(defined $head);
#			$intersection_of_info->{'tail'} = &term_simple_info($tail) if(defined $tail);

			my $head_info;
			$head_info = &term_simple_info($head) if(defined $head);
			$intersection_of_info->{'id'} = $head_info->{'id'} if(defined $head_info && ref $head_info eq 'HASH' && exists $head_info->{'id'} && defined $head_info->{'id'} && length $head_info->{'id'});

#				&common::dumper($intersection_of_info);

			next unless(exists $intersection_of_info->{'id'} && defined $intersection_of_info->{'id'} && length $intersection_of_info->{'id'} && exists $intersection_of_info->{'type'} && defined $intersection_of_info->{'type'} && length $intersection_of_info->{'type'});

			push(@{$term_info->{'intersection_of'}}, $intersection_of_info);
			undef $intersection_of_info;
		}
	}
	undef $intersection_of;


	$term_info->{'is_obsolete'} = 0;
	$term_info->{'is_obsolete'} = 1 if( $term->is_obsolete() );

	$term_info->{'is_anonymous'} = 0;
	$term_info->{'is_anonymous'} = 1 if( $term->is_anonymous() );


	my @xref_set_as_string = $term->xref_set_as_string();
	if(scalar @xref_set_as_string){
		$term_info->{'xref'} = [];
		foreach my $xref (@xref_set_as_string){
			my $xref_name        = $xref->name();
			my $xref_db          = $xref->db();
			my $xref_acc         = $xref->acc();
			my $xref_description = $xref->description();
			my $xref_modifier    = $xref->modifier();
			my $xref = {};
			$xref->{'name'}        = $xref_name        if(defined $xref_name && length $xref_name);
			$xref->{'db'}          = $xref_db          if(defined $xref_db && length $xref_db);
			$xref->{'acc'}         = $xref_acc         if(defined $xref_acc && length $xref_acc);
			$xref->{'description'} = $xref_description if(defined $xref_description && length $xref_description);
			$xref->{'modifier'}    = $xref_modifier    if(defined $xref_modifier && length $xref_modifier);
			push(@{$term_info->{'xref'}}, $xref);
		}
#		&common::message($term_info->{'xref'});
#		exit;
	}
	undef @xref_set_as_string;

	my @alt_ids = $term->alt_id()->get_set();
	if(scalar @alt_ids){
		$term_info->{'alt_id'} = [];
		push(@{$term_info->{'alt_id'}}, @alt_ids);
	}
	undef @alt_ids;


	undef $id;
	undef $name;
	undef $definition;
	undef $comment;


	return $term_info;
}

sub term_simple_info {
	my $term = shift;
	my $term_info = {
		id => undef,
#		name => undef
	};
	my $id = $term->id();
	my $name = $term->name();

	$term_info->{'id'}   = $id   if(defined $id);
	$term_info->{'name'} = $name if(defined $name);

#	&common::dumper($term);

	return $term_info;
}

sub parse {
	my $infile_onto_obo = shift;

	my $parser = OBO::Parser::OBOParser->new;
	my $ontology = $parser->work($infile_onto_obo);

	my $onto_version = $ontology->data_version();
	if(defined $onto_version){
		if($onto_version =~ /^releases\/([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/){
			$onto_version = $1.$2.$3;
		}
		elsif($onto_version =~ /^hp\/releases\/([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/){
			$onto_version = $1.$2.$3;
		}
		else{
			die sprintf('unknown data version format [%s]',$onto_version);
			$onto_version = undef;
		}
	}
	else{
		die 'undefined data version';
		$onto_version = undef;
	}
#	&common::message($ontology->onto_version());
#	&common::message($ontology->date());
#	&common::message($ontology->saved_by());


	my $root_term_id;
#	$root_term_id = 'HP:0000118';

	my $terms = {};
	my $all_terms;
	unless(defined $root_term_id){
		$all_terms = $ontology->get_terms();
	}
	else{
		my $term_PA = $ontology->get_term_by_id($root_term_id);
		$all_terms = $ontology->get_descendent_terms($term_PA);
		$all_terms = [] unless(defined $all_terms && ref $all_terms eq 'ARRAY');
		unshift(@$all_terms, $term_PA);
	}

	if(defined $all_terms && ref $all_terms eq 'ARRAY'){
		foreach my $term (@$all_terms){

			my $selfterm = &term_info($term);
			next unless(ref $selfterm eq 'HASH' && defined $selfterm->{'id'} && defined $selfterm->{'name'});

			my $onto_id = $selfterm->{'id'};

			my $parent_ids = defined $root_term_id && $root_term_id eq $onto_id ? [] : [grep {defined $_} map {$_->id()} @{$ontology->get_parent_terms($term)}];
			$selfterm->{'count_parent'} = defined $parent_ids && ref $parent_ids eq 'ARRAY' ? scalar @$parent_ids : 0;
			if($selfterm->{'count_parent'} > 0){
				$selfterm->{'parent_ids'} = [];
				push(@{$selfterm->{'parent_ids'}}, @$parent_ids);
			}
			undef $parent_ids;

			my $child_ids = [grep {defined $_} map {$_->id()} @{$ontology->get_child_terms($term)}];
			$selfterm->{'count_child'} = defined $child_ids && ref $child_ids eq 'ARRAY' ? scalar @$child_ids : 0;
			if($selfterm->{'count_child'} > 0){
				$selfterm->{'child_ids'} = [];
				push(@{$selfterm->{'child_ids'}}, @$child_ids);
			}
			undef $child_ids;

			$terms->{$onto_id} = $selfterm;
		}

=pod
		foreach my $term (@$all_terms){
			my $onto_id = $term->id();
			next unless(exists $terms->{$onto_id} && defined $terms->{$onto_id} && ref $terms->{$onto_id} eq 'HASH');
			my $selfterm = $terms->{$onto_id};

			$selfterm->{'ancestor_ids'} = undef;
			my $ancestor_ids = [grep {exists $terms->{$_}} map {$_->id()} @{$ontology->get_ancestor_terms($term)}];
			push(@{$selfterm->{'ancestor_ids'}}, @$ancestor_ids) if(defined $ancestor_ids && ref $ancestor_ids eq 'ARRAY' && scalar @$ancestor_ids);
			undef $ancestor_ids;
		}
=cut
	}


#	&common::message("\$max_definition_length=[$max_definition_length]");
#	&common::message("\$max_definition_string=[$max_definition_string]");

	return {
		version => $onto_version,
		terms => $terms
	};
}

package TSVParser;
use Text::CSV_XS;

sub parse {
	my $terms = shift;
	my $ja_file = shift;

#	&common::message($ja_file);

	my $csv = Text::CSV_XS->new ({
		binary => 1,
	#	auto_diag => 1,
		sep_char => "\t",
	#	encoding => "utf-8",
	#	decode_utf8 => 0,
	#	headers => $ja_header,
	#	key => $ja_header->[0]
	});

#	open my $fh, "<:encoding(utf8)", $ja_file or die "[$ja_file]: $!";
	open(my $fh, $ja_file) or die &common::decodeUTF8("[$ja_file]: $!");
# modified start for HPO-japanese.20221104.txt
#	my @hdr = $csv->header ($fh, { set_column_names => 1 });
# modified end for HPO-japanese.20221104.txt
#	&common::message(\@hdr);

	my $ja_hash = {};

	while (my $row = $csv->getline($fh)) {
		next unless(defined $row && ref $row eq 'ARRAY');
		$row = [map {$_ eq 'NA' || length $_ == 0 ? undef : $_} @$row];

		my $id = $row->[0];
		my $name_ja = $row->[2];
# modified start for HPO-japanese.20221104.txt
#		$ja_hash->{$id} = $name_ja;
		my $label = $row->[4];
		if($label eq "label"){
			$ja_hash->{$id} = $name_ja;
		}
# modified end for HPO-japanese.20221104.txt

=pod
		if(exists $terms->{$id} && defined $terms->{$id} && ref $terms->{$id} eq 'HASH'){
			my $name_ja;
			my $i;
			my $l = scalar @$row;
			for($i=2;$i<$l;$i++){
				next unless(defined $row->[$i]);
				$name_ja = $row->[$i];
				last;
			}
			$terms->{$id}->{'name_ja'} = $name_ja;
		}
=cut
	}
	close $fh;

	foreach my $id (keys(%$terms)){
		my $selfterm = $terms->{$id};
		next unless(defined $selfterm && ref $selfterm eq 'HASH');
		$selfterm->{'name_ja'} = $ja_hash->{$selfterm->{'id'}} if(exists $ja_hash->{$selfterm->{'id'}} && defined $ja_hash->{$selfterm->{'id'}} && length $ja_hash->{$selfterm->{'id'}});
	}

	undef $ja_hash;
}

package common;

use Encode;
use JSON::XS;
use Data::Dumper;
$Data::Dumper::Indent = 1;
$Data::Dumper::Sortkeys = 1;

my $JSONXS;
my $JSONXS_Extensions;
BEGIN{
	$JSONXS = JSON::XS->new->utf8->indent(0)->canonical(1);#->relaxed(0);
	$JSONXS_Extensions  = JSON::XS->new->utf8->indent(1)->canonical(1)->relaxed(1);
};

#OBO::Parser::OBOParser中で、「use open qw(:std :utf8);」しているので、入力・出力時にエンコードしていない状態で行う

sub message {
	my $str = shift;
	my $fh = shift // \*STDERR;
	my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
	eval{
		$str = '' unless(defined $str && length $str);
		if(ref $str eq 'HASH' || ref $str eq 'ARRAY'){
			say $fh &decodeUTF8($package.':'.$line.':'.&encodeJSON($str,1));
		}elsif(ref $str ne ''){
			print $fh &decodeUTF8($package.':'.$line.':'.&Data::Dumper::Dumper($str));
		}else{
			say $fh &decodeUTF8($package.':'.$line.':'.&encodeUTF8($str));
		}
	};
	if($@){
		say $fh &decodeUTF8($package.':'.$line.':'.&encodeUTF8($@));
	}
}

sub dumper {
	my $obj = shift;
	my $fh = shift // \*STDERR;
	my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
	print $fh $package.':'.$line.':'.&Data::Dumper::Dumper($obj);
}

sub decodeUTF8 {
	my $str = shift;
	return $str unless(defined $str && length $str);
	$str = &Encode::decode_utf8($str) unless(&Encode::is_utf8($str));
	return $str;
}

sub encodeUTF8 {
	my $str = shift;
	return $str unless(defined $str && length $str);
	$str = &Encode::encode_utf8($str) if(&Encode::is_utf8($str));
	return $str;
}

sub decodeJSON {
	my $json_str = shift;
	my $ext = shift;
	my $json;
	return $json unless(defined $json_str && length $json_str);
	$ext = 1 unless(defined $ext);
	$json_str = &encodeUTF8($json_str);
	eval{$json = $ext ? $JSONXS_Extensions->decode($json_str) : $JSONXS->decode($json_str);};
	if($@){
		say STDERR __FILE__.':'.__LINE__.':'.$@;
		say STDERR __FILE__.':'.__LINE__.':'.$json_str;
	}
	return $json;
}

sub encodeJSON {
	my $json = shift;
	my $ext = shift;
	$ext = 0 unless(defined $ext);
	my $json_str;
	eval{$json_str = $ext ? $JSONXS_Extensions->encode($json) : $JSONXS->encode($json);};
	if($@){
		say STDERR __FILE__.':'.__LINE__.':'.$@ ;
		my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
		say STDERR $package.':'.$line;
	}
	$json_str = &decodeUTF8($json_str);
	return $json_str;
}



package main;

use File::Spec::Functions qw(catdir catfile);
#use Cwd;
#use FindBin;
#use lib $FindBin::Bin;

#use File::Spec::Functions qw(catdir catfile);
#use DB;

sub main {
my $DBD             = "mysql";
my $database        = shift;
my $file_sock       = shift;
my $file_cnf        = shift;
my $db_user         = shift;
my $db_passwd       = shift;
my $infile_onto_obo = shift;
my $infile_onto_hp_japanese = shift;

#	say &common::decodeUTF8("あ");
#	exit;
	#my $infile_onto_obo = 'hp_convert_robot_edit.obo';
#	my $infile_onto_obo = 'hp_convert_robot_edit2.obo';
	#my $infile_onto_obo = 'hp.obo';
	my $term_info;
	&common::message('');
	$term_info = &OBOParser::parse($infile_onto_obo);
	&common::message('');

	my $onto_version = $term_info->{'version'};
	my $terms = $term_info->{'terms'};

#	my $infile_onto_hp_japanese = &catfile(split('/','/opt/services/case/data/PubCases/ontologies/HP/HPO-japanese.alpha.18Oct2017.tsv'));
	&TSVParser::parse($terms,$infile_onto_hp_japanese);

	&common::message('');

	my %params;
	$params{'DBD'}       = $DBD       if(defined $DBD && length $DBD);
	$params{'database'}  = $database  if(defined $database && length $database);
	$params{'file_sock'} = $file_sock if(defined $file_sock && length $file_sock);
	$params{'file_cnf'}  = $file_cnf  if(defined $file_cnf && length $file_cnf);
	$params{'user'}      = $db_user   if(defined $db_user && length $db_user);
	$params{'passwd'}    = $db_passwd if(defined $db_passwd && length $db_passwd);
	my $dbh = &DB::connect(%params);


	$dbh->{'AutoCommit'} = 0;
	$dbh->{'RaiseError'} = 1;
	eval{
		my $sql_insert_info = "insert into casemini_OntoTermHPInformation (OntoVersion, OntoID, OntoName, OntoSynonym, OntoDefinition, OntoComment, OntoAltIDs, OntoParentNum, OntoChildNum, OntoNameJa) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		my $sth_insert_info = $dbh->prepare($sql_insert_info) || die $dbh->errstr;

		my $sql_delete_info = "delete from casemini_OntoTermHPInformation where OntoVersion=?";
		my $sth_delete_info = $dbh->prepare($sql_delete_info) || die $dbh->errstr;

		my $sql_insert_hier = "insert into casemini_OntoTermHPHierarchy (OntoVersion, OntoID, OntoParentID) values(?, ?, ?)";
		my $sth_insert_hier = $dbh->prepare($sql_insert_hier) || die $dbh->errstr;

		my $sql_delete_hier = "delete from casemini_OntoTermHPHierarchy where OntoVersion=?";
		my $sth_delete_hier = $dbh->prepare($sql_delete_hier) || die $dbh->errstr;

		my $sql_insert_ancestor = "insert into casemini_OntoTermHPAncestor (OntoVersion, OntoID, OntoAncestorID) values(?, ?, ?)";
		my $sth_insert_ancestor = $dbh->prepare($sql_insert_ancestor) || die $dbh->errstr;

		my $sql_delete_ancestor = "delete from casemini_OntoTermHPAncestor where OntoVersion=?";
		my $sth_delete_ancestor = $dbh->prepare($sql_delete_ancestor) || die $dbh->errstr;

		my $sql_insert_descendant = "insert into casemini_OntoTermHPDescendant (OntoVersion, OntoID, OntoDescendantID) values(?, ?, ?)";
		my $sth_insert_descendant = $dbh->prepare($sql_insert_descendant) || die $dbh->errstr;

		my $sql_delete_descendant = "delete from casemini_OntoTermHPDescendant where OntoVersion=?";
		my $sth_delete_descendant = $dbh->prepare($sql_delete_descendant) || die $dbh->errstr;

		my $sql_insert_int = "insert into casemini_OntoTermHPIntersection (OntoVersion, OntoID, OntoIntType, OntoIntID) values(?, ?, ?, ?)";
		my $sth_insert_int = $dbh->prepare($sql_insert_int) || die $dbh->errstr;

		my $sql_delete_int = "delete from casemini_OntoTermHPIntersection where OntoVersion=?";
		my $sth_delete_int = $dbh->prepare($sql_delete_int) || die $dbh->errstr;

		my $sql_insert_xref = "insert into casemini_OntoTermHPDbxref (OntoVersion, OntoID, OntoDbxrefName, OntoDbxrefDb, OntoDbxrefAcc, OntoDbxrefDescription, OntoDbxrefModifier) values(?, ?, ?, ?, ?, ?, ?)";
		my $sth_insert_xref = $dbh->prepare($sql_insert_xref) || die $dbh->errstr;

		my $sql_delete_xref = "delete from casemini_OntoTermHPDbxref where OntoVersion=?";
		my $sth_delete_xref = $dbh->prepare($sql_delete_xref) || die $dbh->errstr;

		my $sql_insert_syn = "insert into casemini_OntoTermHPSynonym (OntoVersion, OntoID, OntoSynonym) values(?, ?, ?)";
		my $sth_insert_syn = $dbh->prepare($sql_insert_syn) || die $dbh->errstr;

		my $sql_delete_syn = "delete from casemini_OntoTermHPSynonym where OntoVersion=?";
		my $sth_delete_syn = $dbh->prepare($sql_delete_syn) || die $dbh->errstr;

		$sth_delete_info->execute($onto_version) || die $sth_delete_info->errstr;
		&common::message($sth_delete_info->rows());
		$sth_delete_info->finish;

		$sth_delete_hier->execute($onto_version) || die $sth_delete_hier->errstr;
		&common::message($sth_delete_hier->rows());
		$sth_delete_hier->finish;

		$sth_delete_ancestor->execute($onto_version) || die $sth_delete_ancestor->errstr;
		&common::message($sth_delete_ancestor->rows());
		$sth_delete_ancestor->finish;

		$sth_delete_descendant->execute($onto_version) || die $sth_delete_descendant->errstr;
		&common::message($sth_delete_descendant->rows());
		$sth_delete_descendant->finish;

		$sth_delete_int->execute($onto_version) || die $sth_delete_int->errstr;
		&common::message($sth_delete_int->rows());
		$sth_delete_int->finish;

		$sth_delete_xref->execute($onto_version) || die $sth_delete_xref->errstr;
		&common::message($sth_delete_xref->rows());
		$sth_delete_xref->finish;

		$sth_delete_syn->execute($onto_version) || die $sth_delete_syn->errstr;
		&common::message($sth_delete_syn->rows());
		$sth_delete_syn->finish;

		foreach my $onto_id (keys(%$terms)){
			my $selfterm = $terms->{$onto_id};

			my $exists_ancestor = {};
			my $exists_descendant = {};
			$exists_ancestor->{$onto_id} = {} unless(exists $exists_ancestor->{$onto_id});
			$exists_descendant->{$onto_id} = {} unless(exists $exists_descendant->{$onto_id});

			my $onto_name = $selfterm->{'name'};
			my $onto_name_ja      = exists $selfterm->{'name_ja'}      && defined $selfterm->{'name_ja'}      ? $selfterm->{'name_ja'} : '';
			my $onto_synonym      = exists $selfterm->{'synonym'}      && defined $selfterm->{'synonym'}      ? join('|',@{$selfterm->{'synonym'}}) : '';
			my $onto_definition   = exists $selfterm->{'definition'}   && defined $selfterm->{'definition'}   ? $selfterm->{'definition'} : '';
			my $onto_comment      = exists $selfterm->{'comment'}      && defined $selfterm->{'comment'}      ? $selfterm->{'comment'} : '';
			my $onto_count_parent = exists $selfterm->{'count_parent'} && defined $selfterm->{'count_parent'} ? $selfterm->{'count_parent'} : 0;
			my $onto_count_child  = exists $selfterm->{'count_child'}  && defined $selfterm->{'count_child'}  ? $selfterm->{'count_child'} : 0;
			my $onto_alt_ids      = exists $selfterm->{'alt_id'}       && defined $selfterm->{'alt_id'}       ? join(',',@{$selfterm->{'alt_id'}}) : '';

#			if(exists $selfterm->{'synonym'} && defined $selfterm->{'synonym'} && ref $selfterm->{'synonym'} eq 'ARRAY' && scalar @{$selfterm->{'synonym'}}){
#				&common::message(sprintf("%s\t%s\t%s\t%s",$onto_version,$onto_id,$onto_name,$onto_synonym));
#				&common::message($selfterm->{'synonym'});
#				die __LINE__;
#			}

			$sth_insert_info->execute($onto_version, $onto_id, $onto_name, $onto_synonym, $onto_definition, $onto_comment, $onto_alt_ids, $onto_count_parent, $onto_count_child, $onto_name_ja) || die $sth_insert_info->errstr;

#			&common::message($parent_ids);
			if($onto_count_parent>0){
				my $parent_ids = $selfterm->{'parent_ids'};
				#&common::message($parent_ids);
				if(defined $parent_ids && ref $parent_ids eq 'ARRAY' && scalar @$parent_ids){
					foreach my $parent_id (@$parent_ids){
						$sth_insert_hier->execute($onto_version, $onto_id, $parent_id) || die $sth_insert_hier->errstr;
						$sth_insert_hier->finish;
					}

					foreach my $parent_id (@$parent_ids){
						next if(exists $exists_ancestor->{$onto_id}->{$parent_id});

						$sth_insert_ancestor->execute($onto_version, $onto_id, $parent_id) || die $sth_insert_ancestor->errstr;
						$sth_insert_ancestor->finish;
						$exists_ancestor->{$onto_id}->{$parent_id} = undef;

						&add_ancestor($terms, $exists_ancestor, $sth_insert_ancestor, $onto_version, $onto_id, $parent_id);
					}

				}
			}

			if($onto_count_child>0){
				my $child_ids = $selfterm->{'child_ids'};
				#&common::message($parent_ids);
				if(defined $child_ids && ref $child_ids eq 'ARRAY' && scalar @$child_ids){
					foreach my $child_id (@$child_ids){
						next if(exists $exists_descendant->{$onto_id}->{$child_id});

						$sth_insert_descendant->execute($onto_version, $onto_id, $child_id) || die $sth_insert_descendant->errstr;
						$sth_insert_descendant->finish;
						$exists_descendant->{$onto_id}->{$child_id} = undef;

						&add_descendant($terms, $exists_descendant, $sth_insert_descendant, $onto_version, $onto_id, $child_id);
					}
				}
			}

			undef $exists_ancestor;
			undef $exists_descendant;



			if(exists $selfterm->{'intersection_of'} && defined $selfterm->{'intersection_of'} && ref $selfterm->{'intersection_of'} eq 'ARRAY'){
				my $exists_check = {};
				foreach my $intersection_of (@{$selfterm->{'intersection_of'}}){
					my $int_type = $intersection_of->{'type'};
#					my $int_id = $intersection_of->{'head'}->{'id'};
					my $int_id = $intersection_of->{'id'};
					my $key = $int_type."\t".$int_id;
					next if(exists $exists_check->{$key});
					$sth_insert_int->execute($onto_version, $onto_id, $int_type, $int_id) || die $sth_insert_int->errstr;
					$exists_check->{$key} = undef;
				}
				undef $exists_check;
			}

			if(exists $selfterm->{'xref'} && defined $selfterm->{'xref'} && ref $selfterm->{'xref'} eq 'ARRAY'){
				my $exists_check = {};
				foreach my $xref (@{$selfterm->{'xref'}}){
					my $xref_name        = exists $xref->{'name'}        && defined $xref->{'name'}        ? $xref->{'name'} : '';
					my $xref_db          = exists $xref->{'db'}          && defined $xref->{'db'}          ? $xref->{'db'} : '';
					my $xref_acc         = exists $xref->{'acc'}         && defined $xref->{'acc'}         ? $xref->{'acc'} : '';
					my $xref_description = exists $xref->{'description'} && defined $xref->{'description'} ? $xref->{'description'} : '';
					my $xref_modifier    = exists $xref->{'modifier'}    && defined $xref->{'modifier'}    ? $xref->{'modifier'} : '';
					next unless(length $xref_name);
					next if(exists $exists_check->{$xref_name});
					$sth_insert_xref->execute($onto_version, $onto_id, $xref_name, $xref_db, $xref_acc, $xref_description, $xref_modifier) || die $sth_insert_xref->errstr;
					$exists_check->{$xref_name} = undef;
				}
				undef $exists_check;
			}

			if(exists $selfterm->{'synonym'} && defined $selfterm->{'synonym'} && ref $selfterm->{'synonym'} eq 'ARRAY'){
#				&common::message($selfterm->{'synonym'});
#				die __LINE__;
				my $exists_check = {};
				foreach my $synonym (@{$selfterm->{'synonym'}}){
					next unless(defined $synonym && length $synonym);
					next if(exists $exists_check->{$synonym});
					$sth_insert_syn->execute($onto_version, $onto_id, $synonym) || die $sth_insert_syn->errstr;
					$exists_check->{$synonym} = undef;
				}
				undef $exists_check;
			}

		}
		$sth_insert_info->finish;
		$sth_insert_hier->finish;
		$sth_insert_int->finish;
		$sth_insert_xref->finish;
		$sth_insert_syn->finish;

		undef $sql_insert_info;
		undef $sth_insert_info;

		undef $sql_delete_info;
		undef $sth_delete_info;

		undef $sql_insert_hier;
		undef $sth_insert_hier;

		undef $sql_delete_hier;
		undef $sth_delete_hier;

		undef $sql_insert_ancestor;
		undef $sth_insert_ancestor;

		undef $sql_delete_ancestor;
		undef $sth_delete_ancestor;

		undef $sql_insert_descendant;
		undef $sth_insert_descendant;

		undef $sql_delete_descendant;
		undef $sth_delete_descendant;

		undef $sql_insert_int;
		undef $sth_insert_int;

		undef $sql_delete_int;
		undef $sth_delete_int;

		undef $sql_insert_xref;
		undef $sth_insert_xref;

		undef $sql_delete_xref;
		undef $sth_delete_xref;

		undef $sql_insert_syn;
		undef $sth_insert_syn;

		undef $sql_delete_syn;
		undef $sth_delete_syn;

		$dbh->commit();
	};
	if($@){
		&common::message($@);
		$dbh->rollback();
	}
	$dbh->{'AutoCommit'} = 1;
	$dbh->{'RaiseError'} = 0;


	&common::message('');

#	print &common::encodeJSON($term_info, 1);
	print &common::decodeUTF8(&common::encodeJSON($term_info, 1));
}

sub add_ancestor {
	my $terms = shift;
	my $exists_ancestor = shift;
	my $sth_insert_ancestor = shift;
	my $onto_version = shift;
	my $onto_id = shift;
	my $parent_id = shift;
	my $parent_term = exists $terms->{$parent_id} && defined $terms->{$parent_id} && ref $terms->{$parent_id} eq 'HASH' ? $terms->{$parent_id} : undef;
	return unless(defined $parent_term && ref $parent_term eq 'HASH');
	return unless($parent_term->{'count_parent'}>0);
	my $ancestor_ids = $parent_term->{'parent_ids'};
	return unless(defined $ancestor_ids && ref $ancestor_ids eq 'ARRAY' && scalar @$ancestor_ids);
	foreach my $ancestor_id (@$ancestor_ids){
		next if(exists $exists_ancestor->{$onto_id}->{$ancestor_id});

		$sth_insert_ancestor->execute($onto_version, $onto_id, $ancestor_id) || die $sth_insert_ancestor->errstr;
		$sth_insert_ancestor->finish;
		$exists_ancestor->{$onto_id}->{$ancestor_id} = undef;

		&add_ancestor($terms, $exists_ancestor, $sth_insert_ancestor, $onto_version, $onto_id, $ancestor_id);
	}
}
sub add_descendant {
	my $terms = shift;
	my $exists_descendant = shift;
	my $sth_insert_descendant = shift;
	my $onto_version = shift;
	my $onto_id = shift;
	my $child_id = shift;
	my $child_term = exists $terms->{$child_id} && defined $terms->{$child_id} && ref $terms->{$child_id} eq 'HASH' ? $terms->{$child_id} : undef;
	return unless(defined $child_term && ref $child_term eq 'HASH');

	return unless($child_term->{'count_child'}>0);
	my $descendant_ids = $child_term->{'child_ids'};
	return unless(defined $descendant_ids && ref $descendant_ids eq 'ARRAY' && scalar @$descendant_ids);

	foreach my $descendant_id (@$descendant_ids){
		next if(exists $exists_descendant->{$onto_id}->{$descendant_id});

		$sth_insert_descendant->execute($onto_version, $onto_id, $descendant_id) || die $sth_insert_descendant->errstr;
		$sth_insert_descendant->finish;
		$exists_descendant->{$onto_id}->{$descendant_id} = undef;

		&add_descendant($terms, $exists_descendant, $sth_insert_descendant, $onto_version, $onto_id, $descendant_id);
	}
}

&main(@ARGV);

1;

__END__
#ALTER TABLE OntoTermHP MODIFY COLUMN OntoTerm varchar(3000) character set utf8 collate utf8_bin NOT NULL;
#ALTER TABLE OntoTermHP MODIFY COLUMN OntoIDTerm varchar(3030) character set utf8 collate utf8_bin NOT NULL;

DROP TABLE IF EXISTS `casemini_OntoTermHPInformation`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPInformation` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoName`                 varchar(300)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoSynonym`              varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDefinition`           varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoComment`              varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoAltIDs`               varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoParentNum`            int unsigned NOT NULL default 0,
  `OntoChildNum`             int unsigned NOT NULL default 0,
  `OntoNameJa`               varchar(300)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPInformation_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPInformation_OntoID` (`OntoID`),
   UNIQUE `X_casemini_OntoTermHPInformation_OntoVersion_OntoID` (`OntoVersion`,`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

#hierarchy


DROP TABLE IF EXISTS `casemini_OntoTermHPHierarchy`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPHierarchy` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoParentID`             varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoParentID` (`OntoParentID`),
   UNIQUE `X_casemini_OntoTermHPHierarchy_OntoVersion_OntoID_OntoParentID` (`OntoVersion`,`OntoID`,`OntoParentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `casemini_OntoTermHPAncestor`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPAncestor` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoAncestorID`           varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPAncestor_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPAncestor_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPAncestor_OntoAncestorID` (`OntoAncestorID`),
   UNIQUE `X_casemini_OntoTermHPAncestor_OntoVersion_OntoID_OntoAncestorID` (`OntoVersion`,`OntoID`,`OntoAncestorID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `casemini_OntoTermHPDescendant`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPDescendant` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDescendantID`         varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPDescendant_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPDescendant_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPDescendant_OntoDescendantID` (`OntoDescendantID`),
   UNIQUE `X_casemini_OntoTermHPDescendant_OntoVersion_OntoID_OntoDescendantID` (`OntoVersion`,`OntoID`,`OntoDescendantID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `casemini_OntoTermHPIntersection`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPIntersection` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntType`              varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntID`                varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPIntersection_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPIntersection_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPIntersection_OntoIntType` (`OntoIntType`),
   KEY `X_casemini_OntoTermHPIntersection_OntoIntID` (`OntoIntID`),
   UNIQUE `X_casemini_OntoTermHPIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `casemini_OntoTermHPDbxref`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPDbxref` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefName`           varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDb`             varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefAcc`            varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDescription`    varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefModifier`       varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPDbxref_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPDbxref_OntoID` (`OntoID`),
   UNIQUE `X_casemini_OntoTermHPDbxref_Unique` (`OntoVersion`,`OntoID`,`OntoDbxrefName`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

#ALTER TABLE casemini_OntoTermHPInformation ADD COLUMN `index_OntoSynonym` varchar(3300);
#UPDATE casemini_OntoTermHPInformation SET index_OntoSynonym=OntoSynonym;
#ALTER TABLE casemini_OntoTermHPInformation MODIFY COLUMN index_OntoSynonym varchar(3300) NOT NULL;
#ALTER TABLE casemini_OntoTermHPInformation DROP COLUMN `index_OntoSynonym`;

##ALTER TABLE casemini_OntoTermHPInformation ADD KEY `X_casemini_OntoTermHPInformation_index_OntoSynonym` (`index_OntoSynonym`);


DROP TABLE IF EXISTS `casemini_OntoTermHPSynonym`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPSynonym` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonym`              varchar(300)  NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPSynonym_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPSynonym_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPSynonym_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;
