package org.me.CoViKoa;

import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntModelSpec;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.topbraid.shacl.rules.RuleUtil;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class ModelTransformator {
    private final static Logger logger = LoggerFactory.getLogger(ModelTransformator.class);
    public Model inferencesModel;

    public final String pathRuleCartoToGeoviz = "rdf/rules-carto-to-geoviz.ttl";
    public final String pathDicopal = "rdf/voc-dicopal-2021-08-13.ttl";
    public final String pathCarto = "rdf/voc-carto.ttl";

    public static void main(String[] args) throws FileNotFoundException {
        // TODO: implement a main function to access the model transformation independently
    }

    public static Model getNewDeclarations(OntModel derivationModel) {
        try {
            ModelTransformator mt = new ModelTransformator(derivationModel);
            return mt.inferencesModel;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    public ModelTransformator(OntModel derivationModel) throws FileNotFoundException {
        // Load the Dicopal and the Carto ontologies
        Model baseOnto = ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM_MICRO_RULE_INF);
        baseOnto.read(new FileInputStream(pathDicopal), null, FileUtils.langTurtle);
        baseOnto.read(new FileInputStream(pathCarto), null, FileUtils.langTurtle);

        // The union of the DM and the loaded ontologies...
        Model derivationModelAndBaseOnto = derivationModel.union(baseOnto);

        // Load the SHACL rules dedicated to transforming declaration of carto:CartographicSolutions into gviz:Portrayals
        Model rulesCarto2Gviz = ModelFactory.createOntologyModel();
        rulesCarto2Gviz.read(new FileInputStream(pathRuleCartoToGeoviz), null, FileUtils.langTurtle);

        // Generate new Portrayals if any...
        inferencesModel = RuleUtil.executeRules(derivationModelAndBaseOnto, rulesCarto2Gviz, null, null);

        // TODO: implement logging at info level (count how many portrayal generated, etc.)
    }
}
