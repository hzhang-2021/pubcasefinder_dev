use strict;
use warnings;

my $input_file  = 'custom.txt';  # Replace with your input file name
my $output_file = 'output.txt'; # Replace with your desired output file name

open(my $in, '<', $input_file) or die "Could not open file '$input_file' $!";
open(my $out, '>', $output_file) or die "Could not open file '$output_file' $!";

while (my $line = <$in>) {
    chomp $line;
    my ($id, $name) = split(/\s+/, $line, 2);  # Split line into ID and name
    print $out "$line\n" if $id;              # Write to output if ID is not empty
}

close $in;
close $out;

print "Filtered lines have been written to '$output_file'.\n";

