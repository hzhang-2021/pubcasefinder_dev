#!/usr/bin/perl



use strict;
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
}

my $cnt = 0;
foreach my $line (@items){
    my @fields = split("\t",$line);
    if($type eq 'icd10'){
        if(scalar @fields < 4){
            print $cnt,"\n";
            print scalar @fields ,"\n";
            print $fields[$#fields],"\n";
        }
        $sth->execute($fields[0],$fields[1],$fields[2],$fields[3]);
    }elsif($type eq 'mondo'){
        if(scalar @fields < 6){
            print "cols insuficent @ ",$cnt,"\n";
			my $e = $line;
			$e =~ s/\t/===/g;
			print $e,"\n";
        }
        $fields[1] = '' if(!$fields[1]);
        $fields[2] = '' if(!$fields[2]);
        $fields[3] = '' if(!$fields[3]);
        $fields[4] = '' if(!$fields[4]);
        if(!$fields[5]){
			$fields[5]='';
		}elsif($fields[5]!~/OMIM/){
			print "maleformat OMIM @ line ",$cnt,"\n";
			my $e = $line;
			$e =~ s/\t/===/g;
			print $e,"\n";
		}
        if(!$fields[6]){
			$fields[6] = '';
		}elsif($fields[6]!~/Orphanet/){
			print "maleformat Orphanet @ line ",$cnt,"\n";
			my $e = $line;$e =~ s/\t/===/g;
			print $e,"\n";
		}
        $sth->execute($fields[0],$fields[1],$fields[2],$fields[3],$fields[4],$fields[5],$fields[6]);
    }elsif($type eq 'nando'){
        if(scalar @fields < 7){
            print $cnt,"\n";
            my $e = $line;
            $e =~ s/\t/===/g;
            print $e,"\n";
        }
        $fields[1] = '' if(!$fields[1]);
        $fields[2] = '' if(!$fields[2]);
        $fields[3] = '' if(!$fields[3]);
        $fields[4] = '' if(!$fields[4]);
        $fields[5] = '' if(!$fields[5]);
        if(!$fields[6]){
            $fields[6] = '';
        }elsif($fields[6]!~/MONDO/){
            print "maleformat Orphanet @ line ",$cnt,"\n";
            my $e = $line;$e =~ s/\t/===/g;
            print $e,"\n";
        }
        $sth->execute($fields[0],$fields[1],$fields[2],$fields[3],$fields[4],$fields[5],$fields[6]);
    }
    $cnt++;
}


$dbh->disconnect;
print "Done!\n";
exit;

sub _get_data_from_file {
	my ($filename) = @_;
	open(my $in, $filename) or die($!);

	my $head_line = <$in>;
	my @data = ();

	while(defined (my $line = <$in>)){
		chomp ($line);
        if(length($line)>0){
            $line =~ s/"//g;
            push(@data,$line);
        }
	}
	close($in);	
	
	return @data;
}


