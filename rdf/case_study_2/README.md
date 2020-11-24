## Case study 2

The Derivation Model provided in this case study shows the following features of CoViKoa:

- The definition of the symbolisation for the following concepts from LOAC: InitialSearchArea, CompatibleLocationArea, ProbableLocationArea and ReferenceObject.
- The definition of a single transform operation (through the property `cvkr:transformOperation`) to be applied prior to using the geometry of the InitialSearchArea.
- The definition of a `cvkr:DataIntegrationRule` (making a federated query to integrate data).
- The definition of a `cvkr:MatchingPattern` that uses a chain of properties (defined with `cvkr:patternPropertyChain`) to trigger a different symbolisation (for each Compatible Location Area, we want to reach the category of the reference object used as a target by the LocationRelation of the corresponding clue).

