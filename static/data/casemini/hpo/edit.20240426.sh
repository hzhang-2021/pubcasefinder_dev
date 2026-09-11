cat hp_20240426.obo | \
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
> hp_20240426_edited.obo
