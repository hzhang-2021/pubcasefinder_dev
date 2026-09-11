#!/usr/bin/perl

use strict;
use DBI;
use Data::Dumper;
use JSON;

my $UPSTREAM_ROOT_MONDO_ID = 'MONDO:0000001';


my $DBD           = "mysql";
my $db            = "pubcases";
my $file_sock     = "/opt/services/case/mnt2/local/mysql-5.7.13/mysql.sock";
my $file_cnf      = "/opt/services/case/mnt2/local/mysql-5.7.13/my.cnf";
my $dsn           = "DBI".":".
                    $DBD.":".
                    $db.";".
                    "mysql_socket=$file_sock".";".
                    "mysql_read_default_file=$file_cnf";
my $user          = "pubcase";
my $password      = "pubcase0712";

#####
# initialize DB connection and prepare SQLs
my $dbh = DBI->connect($dsn, $user, $password, {RaiseError => 1, AutoCommit => 1}) || die $DBI::errstr;
$dbh->do("set names utf8");


my %mondo_name_hash = ();
&_get_all_mondo_from_db(\%mondo_name_hash);

my %parent_children_hash = ();
my %children_parent_hash = ();
&get_all_hierarchy(\%parent_children_hash, \%children_parent_hash );

foreach my $parent_mondo_id (sort keys %parent_children_hash){

    my @all_downstream_trace = ();

    &_get_all_downstream_trace(\%parent_children_hash, $parent_mondo_id, $parent_mondo_id, \@all_downstream_trace);

    my %children_hash = ();
    foreach my $downstream_trace (@all_downstream_trace){
        my @trace_nodes = split(',', $downstream_trace);
        foreach my $node_mondo_id (@trace_nodes){
			if($node_mondo_id ne $parent_mondo_id){
            	$children_hash{$node_mondo_id} = 1;
			}
        }
    }

    my $num = scalar (keys %children_hash);
    if($num > 0){
		my @descent_arr = sort keys %children_hash;
		&insert_decendant_to_db($parent_mondo_id, \@descent_arr);
    }

	if(exists $mondo_name_hash{$parent_mondo_id}){
		$mondo_name_hash{$parent_mondo_id}{'descentnum'} = $num;
	}else{
		print "Info: line" .__LINE__. " mondo($parent_mondo_id) from OntoTermMONDOHierarchy not existed at OntoTermMONDOInformation\n";
		$mondo_name_hash{$parent_mondo_id}{'descentnum'} = $num;
		$mondo_name_hash{$parent_mondo_id}{'name'} = $parent_mondo_id;
	}
}



foreach my $child_mondo_id (sort keys %children_parent_hash){

	my @all_upstream_trace = ();

    &_get_all_upstream_trace(\%children_parent_hash, $child_mondo_id, $child_mondo_id, \@all_upstream_trace);

	my %upstream_trace = ();

	foreach my $upstream_trace (sort { $b cmp $a } @all_upstream_trace){

        my @trace_nodes = split(',', $upstream_trace);

		next if($trace_nodes[-1] ne $UPSTREAM_ROOT_MONDO_ID);

		my $current = \%upstream_trace;

        for(my $i=$#trace_nodes; $i>=0; $i--){

			my $spot_mondo_id = $trace_nodes[$i];
			my $spot_name = $spot_mondo_id;
			if(exists $mondo_name_hash{$spot_mondo_id}){
				$spot_name = $mondo_name_hash{$spot_mondo_id}{'name'};
			}
			my $spotnum   = $mondo_name_hash{$spot_mondo_id}{'descentnum'};

			my $spot_key = $spot_mondo_id . "--" . $spotnum . "--" . $spot_name;

			if($spot_mondo_id eq $child_mondo_id){
				$current->{$spot_key} = 1;
			}elsif(exists $current->{$spot_key}){
				$current = \%{$current->{$spot_key}};
			}else{
				$current->{$spot_key} = ();
				$current = \%{$current->{$spot_key}};
			}
        }
    }

	my $child_mondo_name = $child_mondo_id;
	my $descentnum = 0;
	if(exists $mondo_name_hash{$child_mondo_id}){
		$child_mondo_name = $mondo_name_hash{$child_mondo_id}{'name'};
		$descentnum = $mondo_name_hash{$child_mondo_id}{'descentnum'};
	}else{
		print "Info: " . __LINE__  .  " not existed at OntoTermMONDOInformation($child_mondo_id)\n";
	}
	#print "insert trace :$child_mondo_id, $child_mondo_name, $descentnum\n";
	&insert_upstream_trace_to_db($child_mondo_id, $child_mondo_name, $descentnum, \%upstream_trace);
}

print "done!";

exit;

sub _get_all_mondo_from_db{
	my $mondo_name_hash_ref = shift;
	my $sth = $dbh->prepare("select OntoID,OntoName from OntoTermMONDOInformation");
    $sth->execute();
    while (my $ary_ref = $sth->fetchrow_arrayref) {
        my ($mondo_id,$mondo_name) = @$ary_ref;
        $mondo_name_hash_ref->{$mondo_id}{'name'} = $mondo_name;
		$mondo_name_hash_ref->{$mondo_id}{'descentnum'} = 0;
    }
    $sth->finish;
}

sub _get_all_downstream_trace{

     my ($downstream_ref, $mondo_id, $route_str, $out_arr) = @_;

     if(!(exists $downstream_ref->{$mondo_id}) || ( scalar @{$downstream_ref->{$mondo_id}} == 0)){
         # no downstream node exists
         if($mondo_id ne $route_str){
             push @$out_arr,$route_str;
             return 1;
         }else{
             return 0;
         }
     }

     my $cnt = 0;

     my @downstream_arr = @{$downstream_ref->{$mondo_id}};

     foreach my $downstream_mondo_id (@downstream_arr){
         my @tmp = split(",", $route_str);
         if(grep {$_ eq $downstream_mondo_id} @tmp){
             next;             
         }

         $cnt = $cnt + &_get_all_downstream_trace($downstream_ref, $downstream_mondo_id, $route_str . "," . $downstream_mondo_id, $out_arr);
     }

     if($cnt == 0 ){
         if($mondo_id ne $route_str){
             push @$out_arr,$route_str;
             return 1;
         }else{
             return 0;
         }
     }

     return $cnt;
}


sub _get_all_upstream_trace{
	
	my ($upstream_ref, $mondo_id, $route_str, $out_arr) = @_;

	if(!(exists $upstream_ref->{$mondo_id}) || ( scalar @{$upstream_ref->{$mondo_id}} == 0)){
		# no downstream node exists
		if($mondo_id ne $route_str){
			push @$out_arr,$route_str;
			return 1;
		}else{
			return 0;
		}
	}

	my $cnt = 0;
	my @upstream_arr = @{$upstream_ref->{$mondo_id}};
	foreach my $upstream_mondo_id (@upstream_arr){
		my @tmp = split(",", $route_str);
		next if(grep {$_ eq $upstream_mondo_id} @tmp);
		$cnt = $cnt + &_get_all_upstream_trace($upstream_ref, $upstream_mondo_id, $route_str . "," . $upstream_mondo_id, $out_arr);
	}

	if($cnt == 0 ){
		if($mondo_id ne $route_str){
			push @$out_arr,$route_str;
			return 1;
		}else{
			return 0;
		}
	}

	return $cnt;
}

sub get_all_hierarchy{
    my ($downstream_ref, $upstream_ref) = @_;

    my $sth = $dbh->prepare("select OntoID, OntoParentID from OntoTermMONDOHierarchy where OntoID <> OntoParentID");
    $sth->execute();
    while (my $ary_ref = $sth->fetchrow_arrayref) {
        my ($child_mondo_id, $parent_mondo_id) = @$ary_ref;

        if(!(exists $downstream_ref->{$parent_mondo_id})){
			my @t = ();
            $downstream_ref->{$parent_mondo_id} = \@t;
        }

        my @matched2 = grep { $_ eq $child_mondo_id} @{$downstream_ref->{$parent_mondo_id}};
        if(scalar @matched2 == 0){
            push @{$downstream_ref->{$parent_mondo_id}}, $child_mondo_id;
        }

		if(!(exists $downstream_ref->{$child_mondo_id})){
            my @t = ();
            $downstream_ref->{$child_mondo_id} = \@t;
        }




		if(!(exists $upstream_ref->{$child_mondo_id})){
			my @t = ();
            $upstream_ref->{$child_mondo_id} = \@t;
        }

        my @matched3 = grep { $_ eq $parent_mondo_id} @{$upstream_ref->{$child_mondo_id}};
        if(scalar @matched3 == 0){
            push @{$upstream_ref->{$child_mondo_id}}, $parent_mondo_id;
        }

        if(!(exists $upstream_ref->{$parent_mondo_id})){
			my @t = ();
            $upstream_ref->{$parent_mondo_id} = \@t;
        }
    }
    $sth->finish;
}


sub check_downstream_items_num{
    my $mondo_id = shift;
	my $sth_num = $dbh->prepare("select OntoDescendantNum from OntoTermMONDO_all_upstream_trace where OntoID = ?");
    $sth_num->execute($mondo_id);
	my $num_in_db = 0;
	while (my @row = $sth_num->fetchrow_array) {
        $num_in_db = $row[0];
    }
	$sth_num->finish;
    return $num_in_db;
}

sub insert_decendant_to_db{
	my ($root_mondo_id, $decendant_arr_ref) = @_;
	my $sth = $dbh->prepare("INSERT INTO OntoTermMONDO_all_descendant(OntoID,OntoDescendantID) VALUES (?,?)");
	foreach my $descendant_mondo_id ( @$decendant_arr_ref) {
		$sth->execute($root_mondo_id, $descendant_mondo_id);
	}
	$sth->finish;
}

sub insert_upstream_trace_to_db{
    my ($mondo_id,$mondo_name,$OntoDescendantNum,$trace_ref) = @_;
	if(keys %{$trace_ref} == 0){
		my $sth = $dbh->prepare("INSERT INTO OntoTermMONDO_all_upstream_trace(OntoID,OntoName,OntoDescendantNum) VALUES (?,?,?)");
		$sth->execute($mondo_id, $mondo_name, $OntoDescendantNum);
		$sth->finish;
	}else{
		my $json_data = encode_json($trace_ref);
		my $sth = $dbh->prepare("INSERT INTO OntoTermMONDO_all_upstream_trace(OntoID,OntoName,OntoDescendantNum,trace) VALUES (?,?,?,?)");
		$sth->execute($mondo_id, $mondo_name, $OntoDescendantNum, $json_data);
	    $sth->finish;
	}
}
