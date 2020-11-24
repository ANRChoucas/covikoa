## Case study 1

The Derivation Model provided in this case study shows the following features of CoViKoa:

- The definition of the symbolisation for the following concepts from LOAC: InitialSearchArea, CompatibleLocationArea, ProbableLocationArea and ReferenceObject.
- The definition of multiples transform operations (through the property `cvkr:transformOperation`) to be applied prior to using the geometry of some individuals of type InitialSearchArea and ReferenceObject.
- The use of the property `cvkr:preTransformOperation` to bind the geometry of individuals of interest to a variable to be used later by `cvkr:transformOperation`.
- The definition of a `cvkr:DataIntegrationRule` (making a federated query to integrate data).
- The definition of a `cvkr:MatchingPattern` that uses a single property (defined with `cvkr:patternProperty`) to trigger a different symbolisation (for each ReferenceObject, we want to reach its category).

