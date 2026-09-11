#!/usr/bin/perl

use strict;
use warnings;
use DBI;
use utf8;


if ($#ARGV < 0) {
	print STDERR "Usage: $0 [data file(for example: ICD-10.txt)] [type:icd10,mondo,nando]\n";
	exit 1;
}

my $filename = shift;
my $type = shift;

our $DB_NAME = "pubcases";
our $DB_USER = "pubcase";
our $DB_PASS = "pubcase0712";
our $DB_HOST = "localhost";
our $DB_PORT = "3306";

our $DELIMITER = "=";

my $dbh = DBI->connect("dbi:mysql:dbname=$DB_NAME;host=$DB_HOST;port=$DB_PORT","$DB_USER","$DB_PASS") or die "$!\n Error: failed to connect to DB.\n";
$dbh->do("set names utf8"); 

my @items = &_get_data_from_file($filename, $type);

my $sth;

if($type eq 'icd10'){

	$sth = $dbh->prepare("INSERT INTO casemini_icd_10(`ICD-10`,`ICD-10_group`,disease_control_number,disease_name) VALUES (?,?,?,?)");

}elsif($type eq 'mondo'){

	$sth = $dbh->prepare("INSERT INTO casemini_omim_orpha(Mondo,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,OMIM,Orphanet) VALUES (?,?,?,?,?,?,?)");

}elsif($type eq 'nando'){

	$sth = $dbh->prepare("INSERT INTO casemini_nando(NANDO,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,Mondo) VALUES (?,?,?,?,?,?,?)");

}else{
	print "interrupted! unknown type ($type)\n";
	exit -1;
}

my $cnt = 2;
foreach my $line (@items){

    my @fields = split($DELIMITER,$line);

    if($type eq 'icd10'){

        if(scalar @fields < 7){
			print "Interrupted due to format error at line $cnt ($filename)\n";
            print "column count: ", scalar @fields ,"\n";
			print "$line\n";
            exit;
        }

		my $id             = &_clean_col_letters($fields[0]);
		my $label_en       = &_clean_col_letters($fields[1]);
		my $synonym_en     = &_clean_col_letters($fields[2]);
		my $label_ja       = &_clean_col_letters($fields[3]);
		my $synonym_ja     = &_clean_col_letters($fields[4]);
		my $group          = &_clean_col_letters($fields[5]);
		my $control_number = &_clean_col_letters($fields[6]);

		#ICD-10,ICD-10_group,disease_control_number,disease_name
        $sth->execute($id, $group, $control_number, $label_ja);

    }elsif($type eq 'mondo'){

        if(scalar @fields < 6 || scalar @fields > 7){
            print "Interrupted! columns num checking failed @ line:",$cnt,"\n";
            print "there might be unnecessary '=' inside column text at this line.\n";
            print "the line should be divided by '=' as following\n";
            print "ID=label_en=synonym_en=label_ja=synonym_ja=OMIM=Orphanet\n"; 
			print $line,"\n";
            exit;
        }

        my $id         = &_clean_col_letters($fields[0]);
        my $label_en   = &_clean_col_letters($fields[1]);
        my $synonym_en = &_clean_col_letters($fields[2]);
        my $label_ja   = &_clean_col_letters($fields[3]);
        my $synonym_ja = &_clean_col_letters($fields[4]);

        if(!$fields[5]){
			$fields[5]='';
		}elsif($fields[5]!~/OMIM/){
			print "maleformat OMIM @ line $cnt ($filename) \n";
			print $line,"\n";
			exit;
		}
		my $omim = &_clean_col_letters($fields[5]);

        if(!$fields[6]){
			$fields[6] = '';
		}elsif($fields[6]!~/Orphanet/){
			print "maleformat Orphanet @ line $cnt ($filename)\n";
			print $line,"\n";
			exit;
		}
		my $orphanet   = &_clean_col_letters($fields[6]);

        eval {
            #Mondo,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,OMIM,Orphanet
            $sth->execute($id,$label_en,$synonym_en,$label_ja,$synonym_ja,$omim,$orphanet);
        };
        if(my $err = $DBI::err){
            warn "at line: $cnt, Failed to insert data: $DBI::errstr ";
			exit;
        }
    }elsif($type eq 'nando'){
        if(scalar @fields < 6){
            print "Interrupted! columns num checking failed @ line:$cnt ($filename)\n";
            print $line,"\n";
			exit;
        }

		my $id = 'NANDO:' . &_clean_col_letters($fields[0]);
		if($id !~ /^NANDO/){
			$id = 'NANDO:' . $id;
		}

		my $label_en            = &_clean_col_letters($fields[1]);
		my $synonym_en          = &_clean_col_letters($fields[2]);
		my $label_ja            = &_clean_col_letters($fields[3]);
		my $synonym_ja          = &_clean_col_letters($fields[4]);
		my $notification_number = &_clean_col_letters($fields[5]);

        if(!$fields[6]){
            $fields[6] = '';
        }elsif($fields[6]!~/MONDO/){
            print "Interrupted! maleformat MONDO @ line $cnt ($filename)\n";
            print $line,"\n";
			exit;
        }
		my $mondo = &_clean_col_letters($fields[6]);

		#NANDO,notification_number,disease_name_en,disease_name_synonym_en,disease_name_ja,disease_name_synonym_ja,Mondo
        $sth->execute($id,$notification_number,$label_en,$synonym_en,$label_ja,$synonym_ja,$mondo);
    }
    $cnt++;
}


$dbh->disconnect;
print "Done!\n";
exit;

sub _clean_col_letters {
	my $letters = shift;
	if($letters ne ""){
		$letters =~ s/^\s+//;
		$letters =~ s/\s+$//;
        $letters =~ s/^"//;
        $letters =~ s/"$//g;
        $letters =~ s/\t//g;
		$letters =~ s/""/"/g;
	}
	return $letters;
}

sub _get_data_from_file {
	my ($filename) = @_;
	open(my $in, $filename) or die($!);

	my $head_line = <$in>;
	my @data = ();

	while(defined (my $line = <$in>)){
		chomp ($line);
        if(length($line)>0){
            push(@data,$line);
        }
	}
	close($in);	
	
	return @data;
}


