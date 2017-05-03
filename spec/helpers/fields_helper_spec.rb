require 'spec_helper'

describe FieldsHelper do

  before(:each) do
    Child.any_instance.stub(:field_definitions).and_return([])
    @child = Child.create(:name => "Simon", created_by: "bob")
    @child["nested_form_section"] = [
      {"nested_1"=>"Keep", "nested_2"=>"Keep", "nested_3"=>"Keep", "nested_tally_boys" => 3, "nested_tally_girls" => 2, "nested_tally_total" => 5},
      {"nested_1"=>"Drop", "nested_2"=>"Drop", "nested_3"=>"Drop"}
    ]
    @child.save!

    @nested_form = FormSection.new({
      "visible"=>false,
      "is_nested"=>true,
      :order_form_group => 50,
      :order => 10,
      :order_subform => 1,
      :unique_id=>"family_details_section",
      :parent_form=>"case",
      "editable"=>true,
      :fields => [
        Field.new({"name" => "nested_1", "type" => "text_field"}),
        Field.new({"name" => "nested_2", "type" => "text_field"}),
        Field.new({"name" => "nested_3", "type" => "text_field"}),
        Field.new({"name" => "nested_tally", "type" => "tally_field", "autosum_total" => true, "tally" => ['boys', 'girls']}),
      ],
      :initial_subforms => 1,
      "name_all" => "Nested Form Section",
      "description_all" => "Nested Subform",
    })
    @nested_field = Field.new({"name" => "nested_form_section",
               "type" => "subform", "editable" => true,
               "subform_section_id" => @nested_form.id,
               "display_name_all" => "Top 2 Subform"})
    @fields_helper = Object.new.extend FieldsHelper
  end

   #TODO - Primero-587 moved this call out of the view/helper and to the form_section_controller
   xit "should give back tuples of form unique id and display name" do
     first_form = FormSection.new(:name => nil, :unique_id => "first_form", :parent_form => "case")
     second_form = FormSection.new(:name => "Third Form", :unique_id => "third_form", :parent_form => "case")
     third_form = FormSection.new(:name => "Middle Form", :unique_id => "middle_form", :parent_form => "case")
     FormSection.stub(:all).and_return [first_form, second_form, third_form]

     #@fields_helper.forms_for_display.should == [[nil, "first_form"], ["Middle Form", "middle_form"], ["Third Form", "third_form"]]
   end


  describe "field_tag_name" do
    it "should build a tag name from the array of keys" do
      tag_name = @fields_helper.field_tag_name(@child, @nested_field, ["nested_form_section", 0])
      expect(tag_name).to eq("child[nested_form_section][0]")
    end
  end

  describe "field_value" do
    it "should return a value of a nested form for an existing child" do
      value = @fields_helper.field_value(@child, @nested_form.fields[0], ["nested_form_section", 0, "nested_1"])
      expect(value).to eq("Keep")
    end

    it 'appends total to end of tally field value' do
      value = @fields_helper.field_value(@child, @nested_form.fields[3], ["nested_form_section", 0, "nested_tally"])
      expect(value).to eq([3, 2, 5])
    end
  end

  describe "subforms_count" do
    it "should return the number of nested subforms" do
      count = @fields_helper.subforms_count(@child, @nested_field)
      expect(count).to eq(2)
    end
  end

  describe "select_options" do
    it "returns the html options tags for a select box with default option '(Select...)'" do
      field = Field.new :type => Field::SELECT_BOX, :display_name => @field_name, :option_strings_text => "Option 1\nOption 2"
      @fields_helper.select_options(field, "", []).should == [["(Select...)", ""], ["Option 1", "option_1"], ["Option 2", "option_2"]]
    end
  end


end