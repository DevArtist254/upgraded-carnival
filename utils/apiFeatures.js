/**
 * Class representing API query features for filtering, sorting, limiting fields, and pagination.
 */
class APIFeatures {
  /**
   * Creates an instance of APIFeatures.
   * @param {Object} query - The Mongoose query object.
   * @param {Object} queryString - An object representing the query string parameters from the request.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filters the query based on query string parameters.
   * Excludes 'page', 'sort', 'limit', and 'fields' parameters.
   * Converts operators (gte, gt, lte, lt) to MongoDB operators ($gte, $gt, $lte, $lt).
   *
   * @returns {APIFeatures} The current instance of APIFeatures with the query updated.
   */
  filter() {
    const queryStrObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryStrObj[el]);

    let queryStr = JSON.stringify(queryStrObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * Sorts the query results based on the 'sort' query string parameter.
   * Defaults to sorting by '-createdAt' if no 'sort' parameter is provided.
   *
   * @returns {APIFeatures} The current instance of APIFeatures with the query updated.
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * Limits the fields returned in the query results based on the 'fields' query string parameter.
   * Defaults to excluding the '__v' field if no 'fields' parameter is provided.
   *
   * @returns {APIFeatures} The current instance of APIFeatures with the query updated.
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  /**
   * Paginates the query results based on the 'page' and 'limit' query string parameters.
   * Defaults to the first page and a limit of 100 if parameters are not provided.
   *
   * @returns {APIFeatures} The current instance of APIFeatures with the query updated.
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;

/**
     * Here's a breakdown of the components:
        * \b: Asserts a word boundary, ensuring that the matched text is a complete word and not part of a longer word.
        * (gte|gt|lte|lt): A capturing group that matches one of the following options: gte, gt, lte, or lt.
        * g: The global flag, which makes the regex match all occurrences in the input, not just the first one.
        *  / ... /: Delimiters for the regex pattern.

        This pattern is useful if you want to find occurrences of the terms gte, gt, lte, or lt in a string, where they appear as standalone words.
*/
